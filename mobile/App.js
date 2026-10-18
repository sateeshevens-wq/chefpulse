import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookingProvider } from './BookingContext';
import AppNavigation from './AppNavigation';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ChefPulse fatal JavaScript error:', error);
    console.error('ChefPulse component stack:', errorInfo?.componentStack || 'Unavailable');
  }

  render() {
    const { error } = this.state;

    if (error) {
      const errorText = error?.stack || error?.message || String(error);

      return (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>ChefPulse crashed</Text>
          <Text style={styles.errorSubtitle}>Exact JavaScript error:</Text>
          <ScrollView style={styles.errorBox} contentContainerStyle={styles.errorContent}>
            <Text selectable style={styles.errorText}>{errorText}</Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BookingProvider>
        <AppNavigation />
      </BookingProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  errorTitle: {
    color: '#D32F2F',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D32F2F',
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
    marginBottom: 30,
  },
  errorContent: {
    padding: 14,
  },
  errorText: {
    color: '#000000',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'monospace',
  },
});
