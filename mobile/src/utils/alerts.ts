import { Alert } from 'react-native';
import { getErrorMessage } from '../api/client';

export const showErrorAlert = (title: string, error: unknown): void => {
  Alert.alert(title, getErrorMessage(error));
};
