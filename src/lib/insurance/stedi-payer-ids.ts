const PAYER_ID_MAP: Record<string, string> = {
  'cigna': 'CIGNA', 'evernorth': 'CIGNA',
  'aetna': '60054', 'cvs health': '60054',
  'unitedhealthcare': '87726', 'united health': '87726', 'uhc': '87726', 'optum': '87726',
  'humana': '61101', 'centerwell': '61101',
  'florida blue': '00590', 'bcbs of florida': '00590', 'bcbs fl': '00590', 'blue cross florida': '00590',
  'anthem': 'ANTHEM1', 'elevance': 'ANTHEM1', 'wellpoint': 'ANTHEM1',
  'tricare': '99726', 'champus': '99726',
  'medicare': 'MDCR', 'cms': 'MDCR', 'medicare advantage': 'MDCR',
  'oscar': '11303', 'oscar health': '11303',
  'kaiser': 'KPSA0', 'kaiser permanente': 'KPSA0',
  'molina': 'MHHI0', 'molina healthcare': 'MHHI0',
  'wellcare': 'WCA01',
  'bcbs fep': 'BCBSF', 'federal employee': 'BCBSF', 'fep': 'BCBSF', 'federal employees': 'BCBSF',
  'highmark': '00033',
  'carefirst': '00380',
  'horizon': 'HBCBS', 'horizon bcbs': 'HBCBS',
  'bcbs of nc': '00544', 'blue cross nc': '00544',
  'bcbs of texas': '00901', 'bcbs texas': '00901',
  'bcbs of illinois': '00111', 'bcbs illinois': '00111',
  'bcbs of alabama': '00020', 'bcbs alabama': '00020',
  'premera': 'PRMR0', 'premera blue cross': 'PRMR0',
  'regence': 'REGCE', 'regence blueshield': 'REGCE',
  'health net': 'HealthNet', 'healthnet': 'HealthNet',
  'emblemhealth': 'GHIBS',
  'medica': 'MDCAI',
  'select health': 'SLHLT', 'selecthealth': 'SLHLT',
  'geisinger': 'GEISG',
  'upmc': 'UPMCP', 'upmc health plan': 'UPMCP',
  'harvard pilgrim': 'HARVP',
  'tufts health': 'TUFT0', 'tufts': 'TUFT0',
  'va': '12115', 'veterans affairs': '12115', 'va health': '12115',
};

export function resolveStediPayerId(insurerName: string): string {
  const normalized = (insurerName || '').toLowerCase().trim();
  for (const [key, id] of Object.entries(PAYER_ID_MAP)) {
    if (normalized.includes(key)) return id;
  }
  return normalized.replace(/[^a-z0-9]/g, '').slice(0, 10).toUpperCase();
}
