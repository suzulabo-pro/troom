import * as fs from 'fs';
import * as path from 'path';

export const SECRETS_KEYS = [] as const;
type SECRETS_KEYS_UNION = typeof SECRETS_KEYS[number];

export const ROOT_DIR = path.resolve(path.join(__dirname, '../..'));
export const SECRET_DIR = path.join(ROOT_DIR, 'secrets');

class SecretFile {
  constructor(public name: string, public location?: string) {}
}

const Sec = (name: string, locaction?: string) => {
  return new SecretFile(name, locaction);
};

export const SECRET_FILES: SecretFile[] = [Sec('.firebaserc', 'firebase'), Sec('appenv.env.ts')];

export const loadSecretJSON = () => {
  const jsonFile = path.join(SECRET_DIR, 'secrets.json');
  if (!fs.existsSync(jsonFile)) {
    return {};
  }

  const secretsJson: Record<SECRETS_KEYS_UNION, string> = JSON.parse(
    fs.readFileSync(jsonFile, 'utf-8'),
  );

  return secretsJson;
};
