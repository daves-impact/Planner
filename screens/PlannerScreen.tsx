import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getTasks, getStudyPlan, saveStudyPlan } from "@/services/taskService";
import { generateStudyPlan } from "@/services/aiService";
import { getDateString, formatTime } from "@/utils/dateUtils";
import { Task } from "@/services/taskService";

interface ScheduleItem {
  start: string;
  end: string;
  task?: string;
  taskId?: string;
  break?: boolean;
}

export default function PlannerScreen() {
  const [plan, setPlan] = useState<{
    date: string;
    schedule: ScheduleItem[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const today = getDateString();
      const existingPlan = await getStudyPlan(today);
      if (existingPlan) {
        setPlan(existingPlan.plan);
      } else {
        setPlan(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load study plan");
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const tasks = await getTasks();
      const newPlan = await generateStudyPlan(tasks);
      setPlan(newPlan);

      const today = getDateString();
      await saveStudyPlan(today, newPlan);

      Alert.alert("Success", "Study plan generated!");
    } catch (error: any) {
      Alert.alert("Error", "Failed to generate study plan");
    } finally {
      setGenerating(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [loadPlan])
  );

  const renderScheduleItem = ({ item }: { item: ScheduleItem }) => {
    if (item.break) {
      return (
        <View
          style={[
            styles.scheduleItem,
            styles.breakItem,
            { backgroundColor: "#F3F4F6" },
          ]}
        >
          <View style={styles.timeSection}>
            <Text style={[styles.time, { color: "#999" }]}>
              {formatTime(item.start)} - {formatTime(item.end)}
            </Text>
          </View>
          <Text style={[styles.breakText, { color: "#999" }]}>Break</Text>
        </View>
      );
    }

    return (
      <View style={[styles.scheduleItem, { backgroundColor: "#F9FAFB" }]}>
        <View style={styles.timeSection}>
          <Text style={[styles.time, { color: isDark ? "#000" : "#000" }]}>
            {formatTime(item.start)}
          </Text>
          <Text style={[styles.taskName, { color: isDark ? "#aaa" : "#666" }]}>
            to {formatTime(item.end)}
          </Text>
        </View>
        <Text style={[styles.taskLabel, { color: "#222" }]} numberOfLines={2}>
          {item.task}
        </Text>
      </View>
    );
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
        <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
          AI Study Planner
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {plan ? (
            <>
              <View
                style={[
                  styles.planCard,
                  { backgroundColor: isDark ? "#2a2a2a" : "#f9f9f9" },
                ]}
              >
                <Text
                  style={[styles.planDate, { color: isDark ? "#fff" : "#000" }]}
                >
                  {new Date(plan.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>

              <FlatList
                data={plan.schedule}
                renderItem={renderScheduleItem}
                keyExtractor={(item, index) => `${index}`}
                scrollEnabled={false}
                style={styles.scheduleList}
              />

              <TouchableOpacity
                style={[
                  styles.regenerateButton,
                  generating && styles.buttonDisabled,
                ]}
                onPress={generatePlan}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.regenerateButtonText}>
                    🔄 Regenerate Plan
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text
                style={[styles.emptyText, { color: isDark ? "#888" : "#999" }]}
              >
                No study plan yet. Create one based on your tasks!
              </Text>
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  generating && styles.buttonDisabled,
                ]}
                onPress={generatePlan}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.generateButtonText}>
                    ✨ Generate AI Plan
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  planCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  planDate: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  scheduleList: {
    marginBottom: 16,
  },
  scheduleItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  breakItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  timeSection: {
    marginRight: 12,
  },
  time: {
    fontSize: 16,
    fontWeight: "600",
  },
  taskName: {
    fontSize: 12,
    marginTop: 2,
  },
  taskLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  breakText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  generateButton: {
    backgroundColor: "#00C26F",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 200,
    alignItems: "center",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  regenerateButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  regenerateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
