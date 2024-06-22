interface ErrorCode {
  code: string;
  message: string;
  statusCode: number;
}

interface ErrorCodes {
  [key: string]: ErrorCode;
}

const ErrorCodes: ErrorCodes = {
  UNIQUE_FIELD_ERROR: {
    code: 'UNIQUE_FIELD_ERROR',
    message: 'A field that is supposed to be unique already exists.',
    statusCode: 409,
  },
  NOT_FOUND_ERROR: {
    code: 'NOT_FOUND_ERROR',
    message: 'The requested item could not be found.',
    statusCode: 404,
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'There was a problem accessing the database.',
    statusCode: 500,
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed for one or more fields.',
    statusCode: 400,
  },
  GENERAL_ERROR: {
    code: 'GENERAL_ERROR',
    message: 'An unexpected error occurred.',
    statusCode: 500,
  },
  REQUIRED_FIELD_MISSING: {
    code: 'REQUIRED_FIELD_MISSING',
    message: 'Required field(s) missing.',
    statusCode: 400,
  },
  FOUND: {
    code: 'FOUND',
    message: 'The requested item was found.',
    statusCode: 302,
  },
};

export default ErrorCodes;
export type { ErrorCode, ErrorCodes };
