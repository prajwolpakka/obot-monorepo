# Auth Module Test Requirements

## Overview

This document outlines the testing requirements for the Auth module, which handles user authentication, authorization, and related functionality.

## Test Coverage Requirements

- Minimum test coverage: 90%
- All public methods must have tests
- All error handling paths must be tested
- All edge cases must be covered

## Service Tests

### AuthService Tests

#### 1. User Validation

- [ ] Test successful user validation with correct credentials
- [ ] Test validation failure with incorrect password
- [ ] Test validation failure with non-existent user
- [ ] Test validation failure with unverified email
- [ ] Test that password is removed from returned user object

#### 2. Login Functionality

- [ ] Test successful login with valid credentials
- [ ] Test login response structure (access token, user data)
- [ ] Test login with user having no stores
- [ ] Test login with user having multiple stores
- [ ] Test login with user having no active store
- [ ] Test that first store is set as active if no active store exists
- [ ] Test that user permissions are included in response

#### 3. Signup Functionality

- [ ] Test successful user registration
- [ ] Test email verification token creation
- [ ] Test verification email sending
- [ ] Test registration with existing email (conflict)
- [ ] Test password hashing during registration
- [ ] Test email normalization (lowercase)

#### 4. Email Verification

- [ ] Test successful email verification
- [ ] Test verification with invalid token
- [ ] Test verification with expired token
- [ ] Test verification for already verified email
- [ ] Test verification with non-existent user
- [ ] Test token deletion after successful verification

#### 5. Password Reset Flow

- [ ] Test forgot password request with existing email
- [ ] Test forgot password request with non-existent email
- [ ] Test password reset token creation
- [ ] Test reset email sending
- [ ] Test successful password reset
- [ ] Test reset with invalid token
- [ ] Test reset with expired token
- [ ] Test reset with non-existent user
- [ ] Test token deletion after successful reset

#### 6. Password Change

- [ ] Test successful password change
- [ ] Test password change with incorrect current password
- [ ] Test password change with non-existent user
- [ ] Test password hashing during change

#### 7. Google Authentication

- [ ] Test successful Google authentication
- [ ] Test Google authentication with existing user
- [ ] Test Google authentication with new user creation
- [ ] Test Google authentication with invalid token

## Controller Tests

### AuthController Tests

#### 1. Login Endpoint

- [ ] Test successful login request
- [ ] Test login with invalid credentials
- [ ] Test login with missing credentials
- [ ] Test login response structure
- [ ] Test login with unverified email

#### 2. Signup Endpoint

- [ ] Test successful signup request
- [ ] Test signup with existing email
- [ ] Test signup with invalid data
- [ ] Test signup response structure

#### 3. Email Verification Endpoint

- [ ] Test successful verification request
- [ ] Test verification with invalid token
- [ ] Test verification with expired token
- [ ] Test verification response structure

#### 4. Forgot Password Endpoint

- [ ] Test successful forgot password request
- [ ] Test forgot password with non-existent email
- [ ] Test forgot password response structure

#### 5. Reset Password Endpoint

- [ ] Test successful reset password request
- [ ] Test reset with invalid token
- [ ] Test reset with expired token
- [ ] Test reset password response structure

#### 6. Change Password Endpoint

- [ ] Test successful change password request
- [ ] Test change with incorrect current password
- [ ] Test change password response structure

#### 7. Google Auth Endpoint

- [ ] Test successful Google authentication request
- [ ] Test Google auth with invalid token
- [ ] Test Google auth response structure

## Guard Tests

### JwtAuthGuard Tests

- [ ] Test guard with valid token
- [ ] Test guard with invalid token
- [ ] Test guard with expired token
- [ ] Test guard with missing token
- [ ] Test guard with malformed token

### RolesGuard Tests

- [ ] Test guard with user having required role
- [ ] Test guard with user lacking required role
- [ ] Test guard with user having no roles
- [ ] Test guard with missing role parameter

## Strategy Tests

### JwtStrategy Tests

- [ ] Test strategy with valid token
- [ ] Test strategy with invalid token
- [ ] Test strategy with expired token
- [ ] Test strategy with non-existent user
- [ ] Test payload extraction from token

### LocalStrategy Tests

- [ ] Test strategy with valid credentials
- [ ] Test strategy with invalid credentials
- [ ] Test strategy with non-existent user
- [ ] Test strategy with unverified email

### GoogleStrategy Tests

- [ ] Test strategy with valid profile
- [ ] Test strategy with existing user
- [ ] Test strategy with new user creation
- [ ] Test strategy with invalid profile

## Integration Tests

### Auth Flow Integration Tests

- [ ] Test complete signup -> verification -> login flow
- [ ] Test complete forgot password -> reset flow
- [ ] Test login -> change password flow
- [ ] Test Google authentication flow

### Database Integration Tests

- [ ] Test user creation in database
- [ ] Test token creation and deletion
- [ ] Test user updates (verification, password changes)
- [ ] Test store and role associations

## Mock Data Requirements

### User Mock Data

- [ ] Create mock user with all required fields
- [ ] Create mock unverified user
- [ ] Create mock user with stores
- [ ] Create mock user with roles
- [ ] Create mock user with permissions

### Token Mock Data

- [ ] Create mock verification token
- [ ] Create mock password reset token
- [ ] Create mock expired token
- [ ] Create mock invalid token

### Store Mock Data

- [ ] Create mock store with all required fields
- [ ] Create mock store with roles
- [ ] Create mock store with users

### Role Mock Data

- [ ] Create mock role with permissions
- [ ] Create mock role without permissions
- [ ] Create mock admin role
- [ ] Create mock user role

## Test Environment Setup

- [ ] Configure Jest for TypeScript
- [ ] Set up test database
- [ ] Configure environment variables for testing
- [ ] Set up mock services (mail, external APIs)
- [ ] Configure test timeouts and retries

## Example Test Implementation

```typescript
// Example test structure for AuthService
describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    // Setup test module with mocks
  });

  describe("validateUser", () => {
    it("should return user without password if credentials are valid", async () => {
      // Test implementation
    });

    it("should throw UnauthorizedException if user not found", async () => {
      // Test implementation
    });

    // Additional tests...
  });

  // Additional test suites...
});
```
