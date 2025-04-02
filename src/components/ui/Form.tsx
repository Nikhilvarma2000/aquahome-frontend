import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
// import { validationService } from '../../services/validationService';

interface FormState {
  values: { [key: string]: any };
  errors: { [key: string]: string };
  touched: { [key: string]: boolean };
}

interface FormProps {
  initialValues: { [key: string]: any };
  validationSchema?: { [key: string]: (value: any, formValues?: any) => string };
  onSubmit: (values: { [key: string]: any }, isValid: boolean) => void;
  children: (formProps: FormChildProps) => React.ReactNode;
  style?: ViewStyle;
}

export interface FormChildProps {
  values: { [key: string]: any };
  errors: { [key: string]: string };
  touched: { [key: string]: boolean };
  handleChange: (name: string) => (value: any) => void;
  handleBlur: (name: string) => () => void;
  setFieldValue: (name: string, value: any) => void;
  setFieldTouched: (name: string, isTouched: boolean) => void;
  handleSubmit: () => void;
  isValid: boolean;
  resetForm: () => void;
}

const Form: React.FC<FormProps> = ({
  initialValues,
  validationSchema = {},
  onSubmit,
  children,
  style,
}) => {
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
  });

  const validateField = useCallback(
    (name: string, value: any) => {
      if (!validationSchema[name]) return '';
      return validationSchema[name](value, formState.values);
    },
    [validationSchema, formState.values]
  );

  const validateForm = useCallback(() => {
    const errors: { [key: string]: string } = {};
    const { values } = formState;

    Object.keys(validationSchema).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }, [formState.values, validateField, validationSchema]);

  const handleChange = useCallback(
    (name: string) => (value: any) => {
      setFormState((prevState) => {
        const newValues = { ...prevState.values, [name]: value };
        const error = validateField(name, value);
        
        return {
          ...prevState,
          values: newValues,
          errors: {
            ...prevState.errors,
            [name]: error,
          },
        };
      });
    },
    [validateField]
  );

  const handleBlur = useCallback(
    (name: string) => () => {
      setFormState((prevState) => ({
        ...prevState,
        touched: {
          ...prevState.touched,
          [name]: true,
        },
      }));
    },
    []
  );

  const setFieldValue = useCallback(
    (name: string, value: any) => {
      setFormState((prevState) => {
        const newValues = { ...prevState.values, [name]: value };
        const error = validateField(name, value);
        
        return {
          ...prevState,
          values: newValues,
          errors: {
            ...prevState.errors,
            [name]: error,
          },
        };
      });
    },
    [validateField]
  );

  const setFieldTouched = useCallback((name: string, isTouched: boolean) => {
    setFormState((prevState) => ({
      ...prevState,
      touched: {
        ...prevState.touched,
        [name]: isTouched,
      },
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    const errors = validateForm();
    const isValid = Object.keys(errors).length === 0;

    // Mark all fields as touched on submit
    const touchedFields = Object.keys(formState.values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as { [key: string]: boolean });

    setFormState((prevState) => ({
      ...prevState,
      errors,
      touched: touchedFields,
    }));

    onSubmit(formState.values, isValid);
  }, [formState.values, validateForm, onSubmit]);

  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
    });
  }, [initialValues]);

  const isValid = Object.keys(formState.errors).length === 0;

  return (
    <View style={[styles.container, style]}>
      {children({
        values: formState.values,
        errors: formState.errors,
        touched: formState.touched,
        handleChange,
        handleBlur,
        setFieldValue,
        setFieldTouched,
        handleSubmit,
        isValid,
        resetForm,
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default Form;