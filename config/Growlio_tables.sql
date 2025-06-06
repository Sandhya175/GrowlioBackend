use Growlio_db;
-- Users table to store user information for authentication
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user', -- Added to match auth.controller.js
    is_active BOOLEAN DEFAULT TRUE, -- Added to match auth.controller.js
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
);

-- Tokens table to store session tokens for authenticated users
CREATE TABLE tokens (
    token_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tokens_user_id (user_id)
);

-- Portfolio Overviews table to store dashboard summary data
CREATE TABLE portfolio_overviews (
    overview_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(50) NOT NULL,
    value VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    icon_color VARCHAR(50),
    extra VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_portfolio_user_id (user_id)
);

-- Transactions table to store user transactions
CREATE TABLE transactions (
    transaction_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    asset VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status ENUM('COMPLETED', 'PENDING', 'FAILED') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transactions_user_id (user_id)
);

-- Members table to store member details (replacing MongoDB Member.js)
CREATE TABLE members (
    member_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    aadhaar_number VARCHAR(20),
    pan_number VARCHAR(20),
    residential_address TEXT,
    stock_market_email VARCHAR(100),
    stock_market_login_id VARCHAR(50),
    stock_market_password VARCHAR(255),
    demat_account_no VARCHAR(50),
    trading_account_no VARCHAR(50),
    mutual_fund_email VARCHAR(100),
    mutual_fund_login_id VARCHAR(50),
    mutual_fund_password VARCHAR(255),
    mutual_fund_demat_account_no VARCHAR(50),
    mutual_fund_broker_name VARCHAR(100),
    mutual_fund_broker_code VARCHAR(50),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_ifsc_code VARCHAR(20),
    bank_net_banking_email VARCHAR(100),
    bank_branch_name VARCHAR(100),
    bank_password VARCHAR(255),
    passport_no VARCHAR(50),
    passport_issuing_country VARCHAR(100),
    passport_date_of_issue DATE,
    passport_date_of_expiry DATE,
    passport_document VARCHAR(255),
    driving_license_no VARCHAR(50),
    driving_license_issued_from VARCHAR(100),
    driving_license_date_of_issue DATE,
    driving_license_date_of_expiry DATE,
    driving_license_document VARCHAR(255),
    voter_id_no VARCHAR(50),
    voter_id_state_of_issue VARCHAR(100),
    voter_id_date_of_issue DATE,
    voter_id_document VARCHAR(255),
    vehicle_type VARCHAR(50),
    vehicle_brand_name VARCHAR(100),
    vehicle_registration_no VARCHAR(50),
    vehicle_insurance_policy_no VARCHAR(50),
    vehicle_document VARCHAR(255),
    profile_image VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_members_user_id (user_id)
);




use Growlio_db;

-- Nominee Details table (for Stock Market, Mutual Fund, Insurance)
CREATE TABLE nominees (
    nominee_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    member_id BIGINT NOT NULL,
    category ENUM('STOCK_MARKET', 'MUTUAL_FUND', 'INSURANCE') NOT NULL, -- To differentiate between sections
    demat_account_no VARCHAR(50),
    trading_account_no VARCHAR(50),
    broker_name VARCHAR(100),
    broker_code VARCHAR(50),
    nominee_name VARCHAR(100),
    relationship_with_account_holder VARCHAR(50),
    date_of_birth DATE,
    percentage_share VARCHAR(10),
    address TEXT,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    INDEX idx_nominees_member_id (member_id)
);

-- Guardian Details table (for nominees who are minors)
CREATE TABLE guardians (
    guardian_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nominee_id BIGINT NOT NULL,
    guardian_name VARCHAR(100),
    relationship_with_nominee VARCHAR(50),
    contact_number VARCHAR(20),
    address TEXT,
    FOREIGN KEY (nominee_id) REFERENCES nominees(nominee_id) ON DELETE CASCADE,
    INDEX idx_guardians_nominee_id (nominee_id)
);

-- Insurance Information table (to store additional insurance-specific fields)
CREATE TABLE insurance_info (
    insurance_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    member_id BIGINT NOT NULL,
    email VARCHAR(100),
    login_id VARCHAR(50),
    password VARCHAR(255),
    insurance_portal_url VARCHAR(255),
    customer_id_policy_login_id VARCHAR(50),
    agent_name VARCHAR(100),
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    INDEX idx_insurance_member_id (member_id)
);

-- Business Entity table
CREATE TABLE business_entities (
    business_entity_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(100),
    date_of_income DATE,
    uid_no VARCHAR(50),
    company_document VARCHAR(255),
    registration_no VARCHAR(50),
    esi_no VARCHAR(50),
    gstin VARCHAR(50),
    tan VARCHAR(50),
    trade_mark_no VARCHAR(50),
    msme_no VARCHAR(50),
    license_document VARCHAR(255),
    software_name VARCHAR(100),
    software_version VARCHAR(50),
    license_key VARCHAR(50),
    software_license_document VARCHAR(255),
    partnership_type VARCHAR(50),
    date_of_partnership_agreement DATE,
    partner_count INT,
    business_nature VARCHAR(100),
    percentage_share VARCHAR(10),
    pan_document VARCHAR(255),
    partnership_deed_document VARCHAR(255),
    profile_image VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_business_entities_user_id (user_id)
);

-- Stakeholders table (for Business Entity)
CREATE TABLE stakeholders (
    stakeholder_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_entity_id BIGINT NOT NULL,
    full_name VARCHAR(100),
    designation VARCHAR(50),
    email VARCHAR(100),
    contact_number VARCHAR(20),
    date_of_joining DATE,
    aadhaar_number VARCHAR(20),
    pan_number VARCHAR(20),
    id_proof_document VARCHAR(255),
    FOREIGN KEY (business_entity_id) REFERENCES business_entities(business_entity_id) ON DELETE CASCADE,
    INDEX idx_stakeholders_business_entity_id (business_entity_id)
);