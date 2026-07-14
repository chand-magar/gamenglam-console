import type { AttributeValue } from '../../../domain/entities/AttributeValue';

export interface AttributeValueState {
  items:        AttributeValue[];
  total:        number;
  isLoading:    boolean;
  isSubmitting: boolean;
  error:        string | null;
}