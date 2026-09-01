export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateMemberInput(name: string, phone?: string): ValidationResult {
  const errors: Record<string, string> = {};
  const trimmed = name.trim();

  if (!trimmed) {
    errors.name = 'Member name cannot be empty.';
  } else if (trimmed.length < 2) {
    errors.name = 'Member name must be at least 2 characters.';
  }

  if (phone && phone.trim()) {
    const phoneTrimmed = phone.trim();
    // Allow digits, plus, dashes, spaces
    if (!/^[+0-9\s-]{6,20}$/.test(phoneTrimmed)) {
      errors.phone = 'Please enter a valid phone number.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateExpenseInput(
  title: string,
  amount: number,
  buyerId: string,
  date: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!title.trim()) {
    errors.title = 'Expense title or description cannot be empty.';
  }

  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be a positive number greater than 0.';
  }

  if (!buyerId) {
    errors.buyerId = 'Please select the member who paid for this expense.';
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = 'Please provide a valid date in YYYY-MM-DD format.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateDepositInput(
  memberId: string,
  amount: number,
  date: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!memberId) {
    errors.memberId = 'Please select a member.';
  }

  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Deposit amount must be greater than 0.';
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = 'Please provide a valid date in YYYY-MM-DD format.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateMealQuantity(value: number): boolean {
  return !isNaN(value) && value >= 0 && value <= 10;
}
