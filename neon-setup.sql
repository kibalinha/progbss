-- Script SQL para configurar o banco de dados Neon
-- Execute este script no SQL Editor do Neon

-- Limpar tabelas existentes (se necessário)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;
DROP TABLE IF EXISTS sectors CASCADE;

-- Criar tabela de setores
CREATE TABLE sectors (
    name VARCHAR(100) PRIMARY KEY
);

-- Criar tabela de técnicos
CREATE TABLE technicians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sector VARCHAR(100) REFERENCES sectors(name) ON DELETE SET NULL,
    shift VARCHAR(10) CHECK (shift IN ('day', 'night')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de atividades
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    sector VARCHAR(100) REFERENCES sectors(name) ON DELETE SET NULL,
    technician VARCHAR(200),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'not_done', 'extra')),
    date DATE,
    shift VARCHAR(10) CHECK (shift IN ('day', 'night')),
    estimated_time INTEGER DEFAULT 0,
    is_extra BOOLEAN DEFAULT false,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir setores iniciais
INSERT INTO sectors (name) VALUES 
    ('Elétrica'),
    ('Mecânica'),
    ('Utilidades'),
    ('Instrumentação'),
    ('Civil')
ON CONFLICT (name) DO NOTHING;

-- Inserir técnicos iniciais (exemplos)
INSERT INTO technicians (name, sector, shift) VALUES 
    ('João Silva', 'Elétrica', 'day'),
    ('Maria Santos', 'Mecânica', 'day'),
    ('Pedro Oliveira', 'Utilidades', 'night'),
    ('Ana Costa', 'Instrumentação', 'day')
ON CONFLICT DO NOTHING;

-- Inserir atividades iniciais (exemplos)
INSERT INTO activities (description, sector, technician, priority, status, date, shift, estimated_time, is_extra, notes) VALUES 
    ('Manutenção preventiva painel elétrico', 'Elétrica', 'João Silva', 'medium', 'pending', CURRENT_DATE, 'day', 120, false, 'Verificar conexões e cabos'),
    ('Troca de rolamento motor principal', 'Mecânica', 'Maria Santos', 'high', 'in_progress', CURRENT_DATE, 'day', 180, false, 'Peça já solicitada'),
    ('Verificação sistema de ar condicionado', 'Utilidades', 'Pedro Oliveira', 'low', 'pending', CURRENT_DATE, 'night', 60, false, 'Rotina mensal'),
    ('Calibração sensores de pressão', 'Instrumentação', 'Ana Costa', 'medium', 'completed', CURRENT_DATE - 1, 'day', 90, false, 'Concluído com sucesso')
ON CONFLICT DO NOTHING;

-- Criar índices para melhorar performance
CREATE INDEX idx_activities_sector ON activities(sector);
CREATE INDEX idx_activities_technician ON activities(technician);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_technicians_sector ON technicians(sector);

-- Mostrar dados inseridos
SELECT 'Setores criados:' as info;
SELECT * FROM sectors ORDER BY name;

SELECT 'Técnicos criados:' as info;
SELECT * FROM technicians ORDER BY name;

SELECT 'Atividades criadas:' as info;
SELECT * FROM activities ORDER BY created_at DESC;
