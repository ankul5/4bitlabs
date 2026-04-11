import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../config/theme';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { STORE_PRODUCTS, LAB_INVENTORY, USER_DATA, STORE_URL } from '../../data/mockData';

const StoreScreen = ({ navigation }) => {
  const { user } = useAuth();

  const openStore = () => {
    Linking.openURL(STORE_URL).catch(() => {
      Linking.openURL('https://google.com');
    });
  };

  const featured = STORE_PRODUCTS.find(p => p.featured);

  return (
    <View style={styles.container}>
      <Header user={user || USER_DATA} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Editorial Header */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTag}>HARDWARE MANIFEST</Text>
          <Text style={styles.heroTitle}>The Precise{'\n'}Catalyst Store</Text>
          <Text style={styles.heroDesc}>
            Curated industrial-grade components for the modern technical scholar. Precision engineering meets educational exploration.
          </Text>
          <View style={styles.newItemsBadge}>
            <Text style={styles.newItemsNum}>08</Text>
            <View style={styles.newItemsTextWrap}>
              <Text style={styles.newItemsLabel}>NEW ITEMS</Text>
              <Text style={styles.newItemsLabel}>THIS MONTH</Text>
            </View>
          </View>
        </View>

        {/* Featured Product */}
        {featured && (
          <View style={styles.featuredCard}>
            <View style={styles.featuredImageWrap}>
              <Image source={{ uri: featured.image }} style={styles.featuredImage} />
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>{featured.badge?.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.featuredInfo}>
              <View style={styles.featuredInfoLeft}>
                <Text style={styles.featuredName}>{featured.name}</Text>
                <Text style={styles.featuredDesc}>{featured.description}</Text>
              </View>
              <View style={styles.featuredInfoRight}>
                <Text style={styles.featuredPrice}>${featured.price.toFixed(2)}</Text>
                <TouchableOpacity onPress={openStore} activeOpacity={0.9}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryContainer]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.visitStoreBtn}
                  >
                    <Text style={styles.visitStoreBtnText}>Visit Store</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Product Cards */}
        <View style={styles.productsGrid}>
          {/* Resistor Kit */}
          <View style={styles.sideCard}>
            <View style={styles.sideCardHeader}>
              <Text style={styles.sideCardIcon}>📦</Text>
              <Text style={styles.inStockText}>In Stock</Text>
            </View>
            <Text style={styles.sideCardName}>Resistor Kit</Text>
            <Text style={styles.sideCardDesc}>Comprehensive 600-piece metal film resistor set with 1% tolerance across 30 common values.</Text>
            <View style={styles.sideCardFooter}>
              <Text style={styles.sideCardPrice}>$12.50</Text>
              <TouchableOpacity style={styles.arrowBtn} onPress={openStore}>
                <Text style={styles.arrowBtnText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Breadboard */}
          <View style={styles.breadboardCard}>
            <View style={styles.breadboardImageWrap}>
              <Image
                source={{ uri: STORE_PRODUCTS[2]?.image || 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400' }}
                style={styles.breadboardImage}
              />
            </View>
            <Text style={styles.breadboardName}>Breadboard</Text>
            <Text style={styles.breadboardSpec}>830 POINTS / DUAL RAIL</Text>
            <View style={styles.breadboardFooter}>
              <Text style={styles.breadboardPrice}>$6.00</Text>
              <TouchableOpacity onPress={openStore}>
                <Text style={styles.visitStoreLink}>Visit Store</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sensor Pack */}
          <View style={styles.sensorCard}>
            <Text style={styles.sensorTitle}>Sensor Pack</Text>
            <Text style={styles.sensorDesc}>12 Essential sensors including ultrasonic and infrared.</Text>
            <Text style={styles.sensorPrice}>$35.00</Text>
            <TouchableOpacity onPress={openStore} activeOpacity={0.9}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sensorBtn}
              >
                <Text style={styles.sensorBtnText}>Visit Store</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Jumper Wires (Flash Sale) */}
          <View style={styles.flashCard}>
            <View style={styles.flashBadge}>
              <Text style={styles.flashBadgeText}>FLASH SALE</Text>
            </View>
            <Text style={styles.flashName}>Jumper Wires</Text>
            <View style={styles.flashPriceRow}>
              <View>
                <Text style={styles.flashOriginal}>$8.00</Text>
                <Text style={styles.flashPrice}>$4.99</Text>
              </View>
              <TouchableOpacity style={styles.flashCartBtn} onPress={openStore}>
                <Text style={styles.flashCartIcon}>🛒</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Starter Kit CTA */}
          <TouchableOpacity activeOpacity={0.9} onPress={openStore}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.starterKitCard}
            >
              <Text style={styles.starterKitTitle}>Full Starter Kit?</Text>
              <Text style={styles.starterKitDesc}>Get all the essentials in one professional editorial package.</Text>
              <View style={styles.starterKitBtn}>
                <Text style={styles.starterKitBtnText}>Visit Full Store</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Laboratory Inventory */}
        <View style={styles.inventorySection}>
          <View style={styles.inventoryHeader}>
            <Text style={styles.inventoryTitle}>Laboratory Inventory</Text>
            <View style={styles.inventoryLine} />
          </View>
          <View style={styles.inventoryGrid}>
            {LAB_INVENTORY.map((item) => (
              <TouchableOpacity key={item.id} style={styles.inventoryItem} activeOpacity={0.8} onPress={openStore}>
                <View style={styles.inventoryIconWrap}>
                  <Text style={styles.inventoryIcon}>
                    {item.icon === 'memory' ? '💾' : item.icon === 'power' ? '🔌' : item.icon === 'cable' ? '🔗' : '📱'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.inventoryItemName}>{item.name}</Text>
                  <Text style={styles.inventoryItemPrice}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  heroSection: { marginBottom: SPACING['3xl'] },
  heroTag: { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 4, marginBottom: 8 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -1.5, lineHeight: 42, marginBottom: 12 },
  heroDesc: { fontSize: 14, color: COLORS.onSurfaceVariant, lineHeight: 20, marginBottom: SPACING.xl },
  newItemsBadge: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  newItemsNum: { fontSize: 24, fontWeight: '700', color: COLORS.onSurface },
  newItemsTextWrap: { borderLeftWidth: 1, borderLeftColor: COLORS.outlineVariant, paddingLeft: 12 },
  newItemsLabel: { fontSize: 10, fontWeight: '600', color: COLORS.onSurfaceVariant, letterSpacing: 2 },
  featuredCard: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING['2xl'], ...SHADOWS.md },
  featuredImageWrap: { width: '100%', height: 200, position: 'relative' },
  featuredImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  featuredBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  featuredBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: COLORS.white },
  featuredInfo: { padding: SPACING.xl },
  featuredInfoLeft: { marginBottom: SPACING.lg },
  featuredName: { fontSize: 26, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5, marginBottom: 6 },
  featuredDesc: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 19 },
  featuredInfoRight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featuredPrice: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  visitStoreBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: RADIUS.full },
  visitStoreBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  productsGrid: { gap: SPACING.xl, marginBottom: SPACING['3xl'] },
  sideCard: { backgroundColor: COLORS.surfaceContainerLow, borderRadius: RADIUS.xl, padding: SPACING.xl, borderBottomWidth: 4, borderBottomColor: COLORS.tertiary },
  sideCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  sideCardIcon: { fontSize: 32 },
  inStockText: { fontSize: 14, fontWeight: '700', color: COLORS.tertiary },
  sideCardName: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface, marginBottom: 6 },
  sideCardDesc: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 18, marginBottom: SPACING.lg },
  sideCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sideCardPrice: { fontSize: 20, fontWeight: '700', color: COLORS.onSurface },
  arrowBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  arrowBtnText: { fontSize: 18, color: COLORS.primary, fontWeight: '700' },
  breadboardCard: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: RADIUS.xl, padding: SPACING.xl, borderLeftWidth: 4, borderLeftColor: COLORS.primary, ...SHADOWS.sm },
  breadboardImageWrap: { width: '100%', height: 160, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.lg, backgroundColor: COLORS.surfaceContainer },
  breadboardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  breadboardName: { fontSize: 17, fontWeight: '700', color: COLORS.onSurface, marginBottom: 2 },
  breadboardSpec: { fontSize: 10, fontWeight: '600', color: COLORS.onSurfaceVariant, letterSpacing: 2, marginBottom: SPACING.lg },
  breadboardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  breadboardPrice: { fontSize: 20, fontWeight: '900', color: COLORS.onSurface },
  visitStoreLink: { fontSize: 13, fontWeight: '700', color: COLORS.primary, textDecorationLine: 'underline' },
  sensorCard: { backgroundColor: COLORS.surfaceContainerHighest, borderRadius: RADIUS.xl, padding: SPACING['2xl'] },
  sensorTitle: { fontSize: 22, fontWeight: '800', color: COLORS.onSurface, marginBottom: 6 },
  sensorDesc: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 18, marginBottom: SPACING.lg },
  sensorPrice: { fontSize: 24, fontWeight: '900', color: COLORS.onSurface, marginBottom: SPACING.xl },
  sensorBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  sensorBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  flashCard: { backgroundColor: COLORS.secondaryFixed, borderRadius: RADIUS.xl, padding: SPACING['2xl'] },
  flashBadge: { backgroundColor: COLORS.onSurface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.lg },
  flashBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 1, color: COLORS.white },
  flashName: { fontSize: 22, fontWeight: '800', color: COLORS.onSurface, marginBottom: SPACING.lg },
  flashPriceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  flashOriginal: { fontSize: 12, color: 'rgba(25,28,30,0.5)', textDecorationLine: 'line-through', marginBottom: 2 },
  flashPrice: { fontSize: 28, fontWeight: '900', color: COLORS.onSurface },
  flashCartBtn: { width: 48, height: 48, borderRadius: RADIUS.xl, backgroundColor: COLORS.onSurface, alignItems: 'center', justifyContent: 'center' },
  flashCartIcon: { fontSize: 20 },
  starterKitCard: { borderRadius: RADIUS.xl, padding: SPACING['2xl'], alignItems: 'center' },
  starterKitTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white, fontStyle: 'italic', marginBottom: 8 },
  starterKitDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: SPACING.xl },
  starterKitBtn: { backgroundColor: COLORS.white, paddingHorizontal: 32, paddingVertical: 14, borderRadius: RADIUS.full },
  starterKitBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  inventorySection: { marginTop: SPACING['2xl'] },
  inventoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: SPACING.xl },
  inventoryTitle: { fontSize: 21, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5 },
  inventoryLine: { flex: 1, height: 1, backgroundColor: COLORS.surfaceContainerHigh },
  inventoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  inventoryItem: { width: '48%', backgroundColor: COLORS.surfaceContainerLow, borderRadius: RADIUS.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  inventoryIconWrap: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' },
  inventoryIcon: { fontSize: 18 },
  inventoryItemName: { fontSize: 13, fontWeight: '700', color: COLORS.onSurface },
  inventoryItemPrice: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
});

export default StoreScreen;
