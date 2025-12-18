import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileScreen() {
  const { user, isLoading, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: "#FFFFFF" },
        { paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: "#007AFF" }]}>Profile</Text>
      </View>

      {user && (
        <View
          style={[
            styles.userCard,
            { backgroundColor: "#F3F4F6", borderRadius: 16, padding: 16 },
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: "#007AFF", borderRadius: 32 },
            ]}
          >
            <Text
              style={[styles.avatarText, { color: "#fff", fontWeight: "bold" }]}
            >
              {user.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text
              style={[
                styles.userEmail,
                { color: "#222", fontWeight: "bold", fontSize: 16 },
              ]}
            >
              {user.email}
            </Text>
            <Text style={[styles.userId, { color: "#999", fontSize: 12 }]}>
              ID: {user.id.substring(0, 8)}...
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: "#000" }]}>About</Text>
        <View style={[styles.infoBox, { backgroundColor: "#F9FAFB" }]}>
          <Text style={[styles.infoText, { color: "#666" }]}>
            AI-Powered Study Planner v1.0
          </Text>
          <Text style={[styles.infoText, { color: isDark ? "#aaa" : "#666" }]}>
            Built with React Native and Supabase
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
        >
          Features
        </Text>
        <View
          style={[
            styles.featuresList,
            { backgroundColor: isDark ? "#2a2a2a" : "#f9f9f9" },
          ]}
        >
          <Text
            style={[styles.featureText, { color: isDark ? "#aaa" : "#666" }]}
          >
            ✓ AI-powered task parsing
          </Text>
          <Text
            style={[styles.featureText, { color: isDark ? "#aaa" : "#666" }]}
          >
            ✓ Intelligent study scheduling
          </Text>
          <Text
            style={[styles.featureText, { color: isDark ? "#aaa" : "#666" }]}
          >
            ✓ Cloud sync with Supabase
          </Text>
          <Text
            style={[styles.featureText, { color: isDark ? "#aaa" : "#666" }]}
          >
            ✓ Cross-platform support
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, isLoading && styles.buttonDisabled]}
        onPress={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  userCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoBox: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  featuresList: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
  logoutButton: {
    marginHorizontal: 16,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
