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