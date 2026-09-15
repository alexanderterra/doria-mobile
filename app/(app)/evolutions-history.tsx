import { BannerSlot } from "@/components/banners/BannerSlot";
import { Header } from "@/components/common/Header";
import { EvolutionCard } from "@/components/evolution/EvolutionCard";
import { EvolutionFilterModal } from "@/components/evolution/EvolutionFilterModal";
import { ListHeader } from "@/components/evolution/ListHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useEvolutions } from "@/hooks/evolution/useEvolution";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BANNER_SCROLL_CLEARANCE = 140;

export default function EvolutionsHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const {
    evolutions,
    isLoading,
    activeFilter,
    selectedMonthDate,
    applyFilter,
  } = useEvolutions();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Header
        title="Minha Evolução"
        showBackButton={true}
        onBack={() => router.push("/profile")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + BANNER_SCROLL_CLEARANCE },
        ]}
      >
        <ListHeader onFilterPress={() => setIsFilterVisible(true)} />

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#3B82F6"
            style={{ marginTop: 40 }}
          />
        ) : evolutions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhuma evolução encontrada.</Text>
            <Text style={styles.emptySubtitle}>
              Realize uma nova avaliação ou mude o filtro.
            </Text>
          </View>
        ) : (
          evolutions.map((item) => (
            <EvolutionCard key={item.id_avaliacao} item={item} />
          ))
        )}
      </ScrollView>

      <View
        style={[styles.bannerContainer, { bottom: insets.bottom + 16 }]}
      >
        <BannerSlot local="evolucao_mobile" publicoAlvo={role ?? undefined} />
      </View>

      <EvolutionFilterModal
        visible={isFilterVisible}
        activeFilter={activeFilter}
        selectedMonthDate={selectedMonthDate}
        onClose={() => setIsFilterVisible(false)}
        onSelectFilter={applyFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  bannerContainer: { position: "absolute", left: 20, right: 20 },
  emptyState: { alignItems: "center", marginTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#334155" },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
});
