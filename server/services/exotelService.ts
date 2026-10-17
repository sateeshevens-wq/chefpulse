import { config } from '../config.js';

export interface ExotelCallResult {
  sid: string;
  status?: string;
  raw: unknown;
}

export interface ExotelSmsResult {
  sid: string;
  status?: string;
  raw: unknown;
}

function requireApiConfig() {
  if (!config.exotelAccountSid || !config.exotelApiKey || !config.exotelApiToken) {
    throw new Error('Exotel communications are not configured. Set EXOTEL_ACCOUNT_SID, EXOTEL_API_KEY and EXOTEL_API_TOKEN.');
  }
}

function baseUrl(): string {
  return config.exotelRegion === 'singapore' ? 'https://api.exotel.com' : 'https://api.in.exotel.com';
}

function authHeader(): string {
  requireApiConfig();
  return `Basic ${Buffer.from(`${config.exotelApiKey}:${config.exotelApiToken}`, 'utf8').toString('base64')}`;
}

function getSid(body: any, kind: 'Call' | 'SMSMessage'): string {
  const sid = body?.[kind]?.Sid || body?.[kind]?.sid || body?.sid;
  if (!sid) throw new Error(`Exotel returned a successful response without a ${kind} SID.`);
  return String(sid);
}

async function parseResponse(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function connectCustomerAndChef(customerPhone: string, chefPhone: string, customField: string): Promise<ExotelCallResult> {
  requireApiConfig();
  if (!config.exotelCallerId) throw new Error('Exotel calling is not configured. Set EXOTEL_CALLER_ID to your ExoPhone.');

  const params = new URLSearchParams({
    From: customerPhone,
    To: chefPhone,
    CallerId: config.exotelCallerId,
    CallType: 'trans',
    TimeOut: '45',
    TimeLimit: '3600',
    CustomField: customField.slice(0, 128),
  });

  const response = await fetch(`${baseUrl()}/v1/Accounts/${encodeURIComponent(config.exotelAccountSid)}/Calls/connect.json`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  const result = await parseResponse(response);
  if (!response.ok) {
    const message = result?.RestException?.Message || result?.message || `Exotel call failed with HTTP ${response.status}`;
    throw new Error(`Exotel call failed: ${message}`);
  }

  return {
    sid: getSid(result, 'Call'),
    status: result?.Call?.Status,
    raw: result,
  };
}

export async function sendTransactionalSms(to: string, body: string, customField?: string): Promise<ExotelSmsResult> {
  requireApiConfig();
  if (!config.exotelSmsSenderId) throw new Error('Exotel SMS is not configured. Set EXOTEL_SMS_SENDER_ID to your approved sender ID/ExoPhone.');
  if (!body.trim() || body.length > 2000) throw new Error('SMS body must be between 1 and 2000 characters.');
  if (!config.exotelDltEntityId) throw new Error('Indian SMS requires EXOTEL_DLT_ENTITY_ID.');
  if (!config.exotelDltTemplateId) throw new Error('Indian SMS requires EXOTEL_DLT_TEMPLATE_ID.');

  const params = new URLSearchParams({
    From: config.exotelSmsSenderId,
    To: to,
    Body: body,
    SmsType: 'transactional',
    DltEntityId: config.exotelDltEntityId,
    DltTemplateId: config.exotelDltTemplateId,
    ...(customField ? { CustomField: customField.slice(0, 128) } : {}),
  });

  const response = await fetch(`${baseUrl()}/v1/Accounts/${encodeURIComponent(config.exotelAccountSid)}/Sms/send.json`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  const result = await parseResponse(response);
  if (!response.ok) {
    const message = result?.RestException?.Message || result?.message || `Exotel SMS failed with HTTP ${response.status}`;
    throw new Error(`Exotel SMS failed: ${message}`);
  }

  return {
    sid: getSid(result, 'SMSMessage'),
    status: result?.SMSMessage?.Status,
    raw: result,
  };
}
