import Resolver from '@forge/resolver';
import { google } from 'googleapis';

const resolver = new Resolver();

/**
 * Converts a 2D array of values into a CSV formatted string.
 * @param {any[][]} data - The array of arrays from Google Sheets.
 * @returns {string} - A CSV formatted string.
 */
const convertToCsv = (data) => {
  if (!data || data.length === 0) {
    return '';
  }
  return data.map(row => 
    row.map(cell => {
      const cellStr = String(cell || '');
      // Escape quotes and handle commas/newlines
      if (cellStr.includes('"') || cellStr.includes(',') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
};

/**
 * Defines a function that can be invoked by the frontend.
 * This function fetches data from a private Google Sheet using a service account.
 */
resolver.define('fetch-csv', async () => {
  try {
    const { 
      GOOGLE_SERVICE_ACCOUNT_KEY, 
      SPREADSHEET_ID, 
      SHEET_NAME 
    } = process.env;

    if (!GOOGLE_SERVICE_ACCOUNT_KEY || !SPREADSHEET_ID || !SHEET_NAME) {
      throw new Error('Google Sheets API environment variables are not configured in Forge.');
    }
    
    const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY);

    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    console.log(`[BACKEND] Fetching data from Spreadsheet ID: ${SPREADSHEET_ID}, Sheet: ${SHEET_NAME}`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`, // Fetches columns A, B, and C
    });

    const csvData = convertToCsv(response.data.values);

    console.log('[BACKEND] Successfully fetched and converted sheet data.');
    return csvData;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[BACKEND] Error fetching from Google Sheets API:', message);
    throw new Error(`Google Sheets API Error: ${message}`);
  }
});

export const handler = resolver.getDefinitions();
