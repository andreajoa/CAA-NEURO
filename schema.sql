PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE,
  email TEXT,
  plano TEXT NOT NULL DEFAULT 'gratuito',
  plano_expira TEXT,
  org_id INTEGER,
  role TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  name TEXT,
  data_nascimento TEXT,
  diagnostico TEXT,
  responsavel TEXT,
  escola TEXT,
  medicamentos TEXT,
  objetivos_terapeuticos TEXT,
  observacoes TEXT,
  anexos TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  patient_id INTEGER NOT NULL,
  cards_usados TEXT NOT NULL DEFAULT '[]',
  evolucao_observada TEXT,
  notas TEXT,
  objetivos_sessao TEXT,
  duracao_minutos INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  card_key TEXT NOT NULL,
  label TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  position_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_defaults (
  key TEXT PRIMARY KEY,
  cards TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared_boards (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  profile TEXT NOT NULL,
  level TEXT NOT NULL,
  cards TEXT NOT NULL DEFAULT '[]',
  title TEXT NOT NULL DEFAULT 'Prancha CAA',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  nome TEXT,
  fonte TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_prefs (
  user_id TEXT PRIMARY KEY,
  onboarding_done INTEGER NOT NULL DEFAULT 0,
  nome_profissional TEXT,
  registro_crfa TEXT,
  profissao TEXT,
  conselho_regional TEXT,
  telefone TEXT,
  assinatura_base64 TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'clinica',
  cidade TEXT,
  estado TEXT,
  cnpj TEXT,
  responsavel TEXT,
  email TEXT,
  plano TEXT NOT NULL DEFAULT 'gratuito',
  ativo INTEGER NOT NULL DEFAULT 0,
  max_profissionais INTEGER NOT NULL DEFAULT 1,
  max_pacientes INTEGER NOT NULL DEFAULT 3,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS org_members (
  org_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'profissional',
  ativo INTEGER NOT NULL DEFAULT 1,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (org_id, user_id),
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS org_invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'profissional',
  token TEXT NOT NULL UNIQUE,
  usado INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agenda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  patient_id INTEGER,
  titulo TEXT NOT NULL,
  data TEXT NOT NULL,
  hora_inicio TEXT,
  hora_fim TEXT,
  tipo TEXT,
  notas TEXT,
  status TEXT NOT NULL DEFAULT 'agendado',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  acao TEXT NOT NULL,
  recurso TEXT,
  detalhes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  level TEXT NOT NULL DEFAULT 'error',
  source TEXT,
  message TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  profissao TEXT,
  cidade TEXT,
  texto TEXT NOT NULL,
  foto_url TEXT,
  aprovado INTEGER NOT NULL DEFAULT 0,
  destaque INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS board_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  autor TEXT,
  autor_profissao TEXT,
  downloads INTEGER NOT NULL DEFAULT 0,
  cards TEXT NOT NULL DEFAULT '[]',
  aprovado INTEGER NOT NULL DEFAULT 0,
  publico INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_access_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  motivo TEXT,
  aprovado INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  aprovado_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON sessions(patient_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_cards_board ON cards(user_id, card_key, position_index);
CREATE INDEX IF NOT EXISTS idx_shared_boards_user ON shared_boards(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id, ativo);
CREATE INDEX IF NOT EXISTS idx_agenda_user_date ON agenda(user_id, data);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(user_id, endpoint, window_start);
