import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from './supabaseClient';

const UPI_URL = 'upi://pay?pa=YOUR_UPI_ID_HERE&pn=ChefPulse';

export default function B2BJobBoardScreen({ navigation }) {
  const [tab, setTab] = useState('business');
  const [businessName, setBusinessName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState('');
  const [appliedJobs, setAppliedJobs] = useState({});

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from('b2b_job_postings')
      .select('id, business_name, job_title, description, status, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setJobs([]);
      setError('Unable to load chef openings right now.');
    } else {
      setJobs(data || []);
    }
    setLoadingJobs(false);
  }, []);

  useEffect(() => {
    if (tab === 'chef') loadJobs();
  }, [tab, loadJobs]);

  const createPosting = async () => {
    setPosting(true);
    setError('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Please log in to post a vacancy.');

      const { error: insertError } = await supabase.from('b2b_job_postings').insert({
        id: `${user.id}-${Date.now()}`,
        business_name: businessName.trim(),
        job_title: jobTitle.trim(),
        description: description.trim(),
        status: 'open',
      });

      if (insertError) throw insertError;

      setBusinessName('');
      setJobTitle('');
      setDescription('');
      Alert.alert('Job posted', 'Your ₹100 UPI payment was initiated and the vacancy is now live.');
      setTab('chef');
    } catch (e) {
      setError(e?.message || 'Unable to post the vacancy. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const submitPosting = async () => {
    if (posting) return;
    if (!businessName.trim() || !jobTitle.trim() || !description.trim()) {
      Alert.alert('Missing details', 'Please enter the business name, job title, and description.');
      return;
    }

    setPosting(true);
    setError('');

    try {
      await Linking.openURL(UPI_URL);
      await createPosting();
    } catch (e) {
      setPosting(false);
      Alert.alert('UPI payment unavailable', 'No UPI payment app could open this payment link.');
    }
  };

  const applyToJob = (job) => {
    setAppliedJobs(current => ({ ...current, [job.id]: true }));
    Alert.alert('Application submitted', `Your application for ${job.job_title} at ${job.business_name} has been recorded for this test flow.`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Hire a Chef</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'business' && styles.activeTab]} onPress={() => setTab('business')}>
          <Text style={[styles.tabText, tab === 'business' && styles.activeTabText]}>Businesses</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'chef' && styles.activeTab]} onPress={() => setTab('chef')}>
          <Text style={[styles.tabText, tab === 'chef' && styles.activeTabText]}>Chefs</Text>
        </Pressable>
      </View>

      {tab === 'business' ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Post a chef vacancy</Text>
          <Text style={styles.subheading}>Reach local chefs for your restaurant or hotel.</Text>

          <Text style={styles.label}>Business Name</Text>
          <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="Hotel or restaurant name" placeholderTextColor="#9BA39A" />
          <Text style={styles.label}>Job Title</Text>
          <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} placeholder="e.g. Senior Indian Chef" placeholderTextColor="#9BA39A" />
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe the role, cuisine, and requirements" placeholderTextColor="#9BA39A" multiline textAlignVertical="top" />

          <View style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Job Posting Fee</Text>
            <Text style={styles.paymentAmount}>₹100</Text>
            <Text style={styles.paymentNote}>Pay directly through your installed UPI app.</Text>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={[styles.primaryButton, posting && styles.disabled]} onPress={submitPosting} disabled={posting}>
            {posting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Pay ₹100 via UPI & Post Vacancy</Text>}
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Chef openings</Text>
          <Text style={styles.subheading}>View local restaurant and hotel vacancies.</Text>

          {loadingJobs ? (
            <View style={styles.center}><ActivityIndicator size="large" color="#00C853" /></View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.error}>{error}</Text>
              <Pressable style={styles.retry} onPress={loadJobs}><Text style={styles.retryText}>Try Again</Text></Pressable>
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No open vacancies</Text>
              <Text style={styles.emptyText}>New hotel and restaurant openings will appear here.</Text>
            </View>
          ) : (
            jobs.map(job => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobTop}>
                  <View style={styles.jobTitleWrap}>
                    <Text style={styles.jobTitle}>{job.job_title}</Text>
                    <Text style={styles.business}>{job.business_name}</Text>
                  </View>
                  <View style={styles.openBadge}><Text style={styles.openText}>Open</Text></View>
                </View>
                <Text style={styles.jobDescription}>{job.description}</Text>
                <Text style={styles.date}>{new Date(job.created_at).toLocaleDateString('en-IN')}</Text>
                <Pressable style={[styles.applyButton, appliedJobs[job.id] && styles.appliedButton]} onPress={() => applyToJob(job)} disabled={!!appliedJobs[job.id]}>
                  <Text style={styles.applyText}>{appliedJobs[job.id] ? 'Applied' : 'Apply'}</Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  back: { color: '#000000', fontSize: 38, width: 28 },
  title: { color: '#000000', fontSize: 20, fontWeight: '800' },
  spacer: { width: 28 },
  tabs: { flexDirection: 'row', margin: 20, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 9 },
  activeTab: { backgroundColor: '#00C853' },
  tabText: { color: '#666666', fontSize: 14, fontWeight: '700' },
  activeTabText: { color: '#FFFFFF' },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  heading: { color: '#000000', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subheading: { color: '#666666', fontSize: 14, lineHeight: 20, marginBottom: 24 },
  label: { color: '#222222', fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#F8F9F8', borderWidth: 1, borderColor: '#E2E5E2', borderRadius: 12, paddingHorizontal: 14, height: 50, color: '#000000', fontSize: 14 },
  textArea: { height: 120, paddingTop: 14 },
  paymentCard: { backgroundColor: '#F2FFF6', borderWidth: 1, borderColor: '#00C853', borderRadius: 16, padding: 16, marginTop: 22 },
  paymentTitle: { color: '#333333', fontSize: 13, fontWeight: '700' },
  paymentAmount: { color: '#00C853', fontSize: 26, fontWeight: '800', marginTop: 4 },
  paymentNote: { color: '#666666', fontSize: 12, lineHeight: 18, marginTop: 5 },
  primaryButton: { backgroundColor: '#00C853', height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  error: { color: '#D32F2F', fontSize: 13, lineHeight: 18, marginTop: 14, textAlign: 'center' },
  center: { paddingVertical: 60, alignItems: 'center' },
  retry: { marginTop: 16, backgroundColor: '#00C853', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: '#FFFFFF', fontWeight: '800' },
  empty: { backgroundColor: '#F8F9F8', borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 12 },
  emptyTitle: { color: '#000000', fontSize: 18, fontWeight: '800' },
  emptyText: { color: '#666666', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  jobCard: { backgroundColor: '#F8F9F8', borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 16, padding: 16, marginBottom: 14 },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobTitleWrap: { flex: 1, paddingRight: 10 },
  jobTitle: { color: '#000000', fontSize: 17, fontWeight: '800' },
  business: { color: '#00C853', fontSize: 14, fontWeight: '700', marginTop: 4 },
  openBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  openText: { color: '#00C853', fontSize: 11, fontWeight: '800' },
  jobDescription: { color: '#555555', fontSize: 13, lineHeight: 19, marginTop: 14 },
  date: { color: '#888888', fontSize: 11, marginTop: 10 },
  applyButton: { height: 44, backgroundColor: '#00C853', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  appliedButton: { backgroundColor: '#7CB342' },
  applyText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
