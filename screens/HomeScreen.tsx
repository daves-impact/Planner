import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getTasks, deleteTask } from "@/services/taskService";
import {
  formatDateTime,
  getDaysUntilDeadline,
  getPriorityColor,
  calculateDurationDisplay,
} from "@/utils/dateUtils";
import { Task } from "@/services/taskService";

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await deleteTask(id);
          if (success) {
            setTasks(tasks.filter((t) => t.id !== id));
          }
        },
      },
    ]);
  };

  const renderTask = ({ item }: { item: Task }) => {
    const daysUntil = getDaysUntilDeadline(item.deadline);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: "#F3F4F6" }]}
        onPress={() =>
          router.push({ pathname: "/add-task", params: { taskId: item.id } })
        }
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleSection}>
            <View
              style={[
                styles.priorityIndicator,
                { backgroundColor: priorityColor },
              ]}
            />
            <Text style={[styles.taskTitle, { color: "#000" }]}>
              {item.title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>

        {item.description && (
          <Text
            style={[styles.taskDescription, { color: "#666" }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        <View style={styles.taskMeta}>
          <Text style={[styles.metaText, { color: "#999" }]}>
            ⏱ {calculateDurationDisplay(item.duration)}
          </Text>
          <Text style={[styles.metaText, { color: "#000000ff" }]}>
            📅{" "}
            {daysUntil === 0
              ? "Today"
              : daysUntil === 1
              ? "Tomorrow"
              : `${daysUntil}d`}
          </Text>
        </View>

        <Text style={[styles.deadline, { color: "#000000ff" }]}>
          Due: {formatDateTime(item.deadline)}
        </Text>
      </TouchableOpacity>
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
        <Text style={[styles.title, { color: "#000" }]}>My Tasks</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: "#999" }]}>
            No tasks yet. Create your first one!
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          scrollIndicatorInsets={{ right: 1 }}
        />
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  taskCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 24,
    color: "#FF6B6B",
  },
  taskDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  deadline: {
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
});
