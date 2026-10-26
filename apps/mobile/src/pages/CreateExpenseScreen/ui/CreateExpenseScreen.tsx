import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import {
  AmountCurrencyInput,
  MembersSplitList,
  ReceiptPickerButton,
  SplitTypeSelector,
  useCreateExpenseForm,
} from '@features/create-expense';
import {
  AppHeader,
  Button,
  ErrorBanner,
  Input,
  ScreenLayout,
  spacing,
} from '@shared/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateExpense'>;

export const CreateExpenseScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { groupId } = route.params;

  const {
    formState,
    splitPreview,
    totalAmountMinor,
    isSubmitting,
    isCompressingReceipt,
    error,
    setTitle,
    setAmount,
    setCurrency,
    setSplitType,
    updateMemberShare,
    attachReceipt,
    submitExpense,
  } = useCreateExpenseForm(groupId, () => navigation.goBack());

  return (
    <ScreenLayout scrollable>
      <AppHeader
        title="New Expense"
        subtitle="Record shared purchase"
        onBack={() => navigation.goBack()}
      />

      {error && <ErrorBanner message={error} />}

      <Input
        label="Description"
        placeholder="e.g. Team Dinner, Groceries"
        value={formState.title}
        onChangeText={setTitle}
        containerStyle={styles.inputContainer}
      />

      <AmountCurrencyInput
        amount={formState.amountInput}
        currency={formState.currency}
        onChangeAmount={setAmount}
        onChangeCurrency={setCurrency}
      />

      <SplitTypeSelector
        selected={formState.splitType}
        onSelect={setSplitType}
      />

      <MembersSplitList
        members={splitPreview}
        splitType={formState.splitType}
        currency={formState.currency}
        totalAmount={totalAmountMinor}
        onChangeShare={updateMemberShare}
      />

      <ReceiptPickerButton
        base64Preview={formState.receiptBase64}
        onPick={attachReceipt}
        loading={isCompressingReceipt}
      />

      <View style={styles.actionsContainer}>
        <Button
          title="Save Expense"
          onPress={submitExpense}
          loading={isSubmitting}
          variant="primary"
          size="lg"
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing.md,
  },
  actionsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
});
