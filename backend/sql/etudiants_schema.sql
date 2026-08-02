-- ============================================================================
-- Schéma SQL — table "etudiants"
-- ----------------------------------------------------------------------------
-- Ce script est un livrable autonome (PostgreSQL) répondant tel quel à la
-- demande : id, Nom, Prénom, e-mail, numéro de téléphone, date d'inscription,
-- formation, avec clés primaires et contraintes.
--
-- Dans l'application réelle (backend/prisma/schema.prisma), un étudiant est
-- déjà modélisé via `User` (role = STUDENT) + `Enrollment` + `Session` +
-- `Course`, ce qui permet plusieurs formations par étudiant. Ce script ne
-- remplace pas ce schéma applicatif : il fournit la version dénormalisée
-- demandée, utilisable telle quelle pour un exercice, une base de test ou un
-- export.
-- ============================================================================

-- Nécessaire pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Table de référence des formations (évite de dupliquer le libellé en texte
-- libre dans "etudiants" et permet la contrainte de clé étrangère demandée).
-- ----------------------------------------------------------------------------
CREATE TABLE formations (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom  VARCHAR(150) NOT NULL,

    CONSTRAINT uq_formations_nom UNIQUE (nom)
);

-- ----------------------------------------------------------------------------
-- Table "etudiants"
-- ----------------------------------------------------------------------------
CREATE TABLE etudiants (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom               VARCHAR(100) NOT NULL,
    prenom            VARCHAR(100) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    telephone         VARCHAR(20)  NOT NULL,
    date_inscription  DATE         NOT NULL DEFAULT CURRENT_DATE,
    formation_id      UUID         NOT NULL,

    -- Un email identifie un étudiant de façon unique.
    CONSTRAINT uq_etudiants_email UNIQUE (email),

    -- Format d'email simple (validation applicative complète côté backend).
    CONSTRAINT chk_etudiants_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

    -- Numéro de téléphone : chiffres, espaces, +()- uniquement, 6 à 20 caractères.
    CONSTRAINT chk_etudiants_telephone_format
        CHECK (telephone ~ '^\+?[0-9 ()-]{6,20}$'),

    -- La date d'inscription ne peut pas être future.
    CONSTRAINT chk_etudiants_date_inscription
        CHECK (date_inscription <= CURRENT_DATE),

    -- Chaque étudiant est rattaché à une formation existante ;
    -- interdit la suppression d'une formation encore utilisée.
    CONSTRAINT fk_etudiants_formation
        FOREIGN KEY (formation_id) REFERENCES formations (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Accélère les recherches par formation et par nom dans le tableau de bord.
CREATE INDEX idx_etudiants_formation_id ON etudiants (formation_id);
CREATE INDEX idx_etudiants_nom_prenom ON etudiants (nom, prenom);

-- ----------------------------------------------------------------------------
-- Exemple de données
-- ----------------------------------------------------------------------------
-- INSERT INTO formations (nom) VALUES ('Power BI — Analyse de données');
--
-- INSERT INTO etudiants (nom, prenom, email, telephone, formation_id)
-- VALUES (
--     'Ben Ali', 'Sarra', 'sarra.benali@example.tn', '+216 20 123 456',
--     (SELECT id FROM formations WHERE nom = 'Power BI — Analyse de données')
-- );
