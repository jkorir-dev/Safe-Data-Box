const FIRST_NAMES = [
  'Japhet', 'Wanjiku', 'Kamau', 'Achieng', 'Otieno', 'Mutua', 'Chebet',
  'Kiprop', 'Njeri', 'Ochieng', 'Muthoni', 'Barasa', 'Makena', 'Njoroge',
  'Wambui', 'Kibet', 'Akinyi', 'Mwangi', 'Zainab', 'Hassan'
];

const LAST_NAMES = [
  'Korir', 'Kariuki', 'Odhiambo', 'Njuguna', 'Mutisya', 'Kiptoo', 'Omondi',
  'Githinji', 'Wekesa', 'Kimani', 'Nyambura', 'Muriuki', 'Cheruiyot', 'Abdi'
];

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu',
  'Machakos', 'Kajiado', 'Kilifi', 'Nyeri', 'Meru', 'Kakamega', 'Kericho'
];

const SAFARICOM_PREFIXES = ['701', '702', '710', '711', '712', '714', '715', '720', '721', '722', '740', '790'];
const AIRTEL_PREFIXES = ['733', '734', '735', '750', '780'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

export function generateKenyanPhone() {
  const prefix = randomItem([...SAFARICOM_PREFIXES, ...AIRTEL_PREFIXES]);
  return `+254 ${prefix} ${randomDigits(3)} ${randomDigits(3)}`;
}

export function generateMpesaCode() {
  // Realistic 10-character M-Pesa transaction code (e.g., SK94M2LP8Q)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'S' + randomItem(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']);
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateKenyanName() {
  return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
}

export function generateKraPin() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const suffix = letters[Math.floor(Math.random() * letters.length)];
  return `A00${randomDigits(7)}${suffix}`;
}

export function generateUuid() {
  return `usr_${Math.random().toString(36).substring(2, 10)}`;
}

export function generateFieldValue(type, index = 0) {
  switch (type) {
    case 'kenyan_phone':
      return generateKenyanPhone();
    case 'mpesa_code':
      return generateMpesaCode();
    case 'kenyan_name':
      return generateKenyanName();
    case 'kenyan_county':
      return randomItem(KENYAN_COUNTIES);
    case 'kra_pin':
      return generateKraPin();
    case 'kes_amount':
      return Math.floor(Math.random() * 49500) + 500;
    case 'relational_id':
      return `REL-${1001 + index}`;
    case 'uuid':
      return generateUuid();
    case 'email': {
      const name = generateKenyanName().toLowerCase().replace(' ', '.');
      return `${name}${Math.floor(Math.random() * 90 + 10)}@example.co.ke`;
    }
    case 'boolean':
      return Math.random() > 0.3;
    case 'iso_date':
      return new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString();
    default:
      return `sample_value_${index + 1}`;
  }
}

export function generateDataset(fields, count = 5) {
  const safeCount = Math.min(Math.max(Number(count) || 1, 1), 50);
  const records = [];

  for (let i = 0; i < safeCount; i++) {
    const row = {};
    fields.forEach((field) => {
      if (field.key && field.key.trim()) {
        row[field.key.trim()] = generateFieldValue(field.type, i);
      }
    });
    records.push(row);
  }

  return records;
}

export const FIELD_TYPE_OPTIONS = [
  { value: 'relational_id', label: 'Relational ID (REL-1001)' },
  { value: 'uuid', label: 'Unique ID (usr_x9a2b)' },
  { value: 'kenyan_name', label: 'Kenyan Full Name' },
  { value: 'kenyan_phone', label: 'Kenyan Phone (+254)' },
  { value: 'mpesa_code', label: 'M-Pesa Transaction Code' },
  { value: 'kes_amount', label: 'KES Amount (500 - 50,000)' },
  { value: 'kenyan_county', label: 'Kenyan County' },
  { value: 'kra_pin', label: 'KRA PIN (A00...Z)' },
  { value: 'email', label: 'Email Address (.co.ke)' },
  { value: 'boolean', label: 'Boolean (true/false)' },
  { value: 'iso_date', label: 'ISO Timestamp' },
];
