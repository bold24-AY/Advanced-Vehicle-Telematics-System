#define _USE_MATH_DEFINES
#include <iostream>
#include <vector>
#include <map>
#include <unordered_map>
#include <deque>
#include <queue>
#include <string>
#include <chrono>
#include <thread>
#include <random>
#include <iomanip>
#include <algorithm>
#include <mutex>
#include <condition_variable>
#include <atomic>
#include <fstream>
#include <sstream>
#include <memory>
#include <functional>
#include <numeric>
#include <cmath>
#include <limits>
#include <ctime>
#include <future>
#include <regex>
#include <set>

#if defined(_WIN32)
#include <ctime>
#endif

// ============================================================================
// ENHANCED UTILITY FUNCTIONS
// ============================================================================

constexpr double deg2rad(double deg) { return deg * M_PI / 180.0; }

double haversine(double lat1, double lon1, double lat2, double lon2) {
    constexpr double R = 6371.0;
    double dLat = deg2rad(lat2-lat1);
    double dLon = deg2rad(lon2-lon1);
    double a = std::sin(dLat/2) * std::sin(dLat/2) +
               std::cos(deg2rad(lat1)) * std::cos(deg2rad(lat2)) *
               std::sin(dLon/2) * std::sin(dLon/2);
    double c = 2 * std::atan2(std::sqrt(a), std::sqrt(1-a));
    return R * c;
}

// Enhanced timestamp formatting with milliseconds
std::string formatTimestamp(const std::chrono::system_clock::time_point& tp) {
    auto time_t = std::chrono::system_clock::to_time_t(tp);
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
        tp.time_since_epoch()) % 1000;
    
    std::stringstream ss;
#if defined(_WIN32)
    struct tm time_info;
    localtime_s(&time_info, &time_t);
    ss << std::put_time(&time_info, "%H:%M:%S");
#else
    struct tm time_info;
    localtime_r(&time_t, &time_info);
    ss << std::put_time(&time_info, "%H:%M:%S");
#endif
    ss << "." << std::setfill('0') << std::setw(3) << ms.count();
    return ss.str();
}

// ============================================================================
// ENHANCED ENUMS AND DATA STRUCTURES
// ============================================================================

enum class AnomalyType {
    SPEED_OUT_OF_RANGE,
    RPM_OUT_OF_RANGE,
    TEMP_OUT_OF_RANGE,
    SUDDEN_SPEED_CHANGE,
    SUDDEN_RPM_CHANGE,
    SUDDEN_TEMP_CHANGE,
    ENGINE_STALL,
    OVERHEATING_PATTERN,
    ERRATIC_BEHAVIOR,
    SENSOR_FAILURE,
    FUEL_LEAK,
    MAINTENANCE_REQUIRED,
    GEOFENCE_VIOLATION,
    HARSH_ACCELERATION,
    HARSH_BRAKING
};

enum class VehicleState {
    NORMAL,
    WARNING,
    CRITICAL,
    OFFLINE,
    MAINTENANCE
};

enum class AlertPriority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4,
    EMERGENCY = 5
};

// Enhanced sensor reading with additional fields
struct SensorReading {
    std::chrono::system_clock::time_point timestamp;
    int vehicle_id = 0;
    double speed_kmph = 0.0;
    double rpm = 0.0;
    double engine_temp_celsius = 0.0;
    double fuel_level_percent = 0.0;
    double throttle_position_percent = 0.0;
    bool engine_on = true;
    double latitude = 0.0;
    double longitude = 0.0;
    
    // Enhanced fields
    double acceleration_ms2 = 0.0;
    double brake_pressure_bar = 0.0;
    double oil_pressure_bar = 0.0;
    double battery_voltage = 12.0;
    int odometer_km = 0;
    bool abs_active = false;
    bool traction_control_active = false;
    
    SensorReading() = default;
    
    SensorReading(int vid, double speed, double r, double temp, double fuel = 50.0,
                  double throttle = 0.0, bool engine = true, double lat = 0.0, double lon = 0.0)
        : timestamp(std::chrono::system_clock::now()),
          vehicle_id(vid), speed_kmph(speed), rpm(r), engine_temp_celsius(temp),
          fuel_level_percent(fuel), throttle_position_percent(throttle),
          engine_on(engine), latitude(lat), longitude(lon) {}
    
    std::string getTimestampString() const {
        return formatTimestamp(timestamp);
    }
    
    std::string toCSV() const {
        std::stringstream ss;
        ss << std::fixed << std::setprecision(2)
           << getTimestampString() << ","
           << vehicle_id << ","
           << speed_kmph << ","
           << rpm << ","
           << engine_temp_celsius << ","
           << fuel_level_percent << ","
           << throttle_position_percent << ","
           << (engine_on ? "1" : "0") << ","
           << latitude << ","
           << longitude << ","
           << acceleration_ms2 << ","
           << brake_pressure_bar << ","
           << oil_pressure_bar << ","
           << battery_voltage << ","
           << odometer_km << ","
           << (abs_active ? "1" : "0") << ","
           << (traction_control_active ? "1" : "0");
        return ss.str();
    }
};

// Enhanced anomaly record with additional metadata
struct AnomalyRecord {
    std::chrono::system_clock::time_point timestamp;
    int vehicle_id;
    std::string sensor_name;
    double value;
    AnomalyType type;
    std::string description;
    int severity;
    AlertPriority priority;
    bool acknowledged = false;
    std::string location_info;
    
    AnomalyRecord(int vid, const std::string& sensor, double val, AnomalyType t,
                  const std::string& desc, int sev = 3, const std::string& loc = "")
        : timestamp(std::chrono::system_clock::now()),
          vehicle_id(vid), sensor_name(sensor), value(val), type(t),
          description(desc), severity(sev), location_info(loc) {
        priority = static_cast<AlertPriority>(std::min(5, std::max(1, sev)));
    }
    
    std::string getTimestampString() const {
        return formatTimestamp(timestamp);
    }
    
    std::string getSeverityString() const {
        switch(severity) {
            case 1: return "LOW";
            case 2: return "MINOR";
            case 3: return "MODERATE";
            case 4: return "HIGH";
            case 5: return "CRITICAL";
            default: return "UNKNOWN";
        }
    }
    
    std::string getTypeString() const {
        switch(type) {
            case AnomalyType::SPEED_OUT_OF_RANGE: return "SPEED_RANGE";
            case AnomalyType::RPM_OUT_OF_RANGE: return "RPM_RANGE";
            case AnomalyType::TEMP_OUT_OF_RANGE: return "TEMP_RANGE";
            case AnomalyType::SUDDEN_SPEED_CHANGE: return "SPEED_SPIKE";
            case AnomalyType::SUDDEN_RPM_CHANGE: return "RPM_SPIKE";
            case AnomalyType::SUDDEN_TEMP_CHANGE: return "TEMP_SPIKE";
            case AnomalyType::ENGINE_STALL: return "ENGINE_STALL";
            case AnomalyType::OVERHEATING_PATTERN: return "OVERHEATING";
            case AnomalyType::ERRATIC_BEHAVIOR: return "ERRATIC";
            case AnomalyType::SENSOR_FAILURE: return "SENSOR_FAIL";
            case AnomalyType::FUEL_LEAK: return "FUEL_LEAK";
            case AnomalyType::MAINTENANCE_REQUIRED: return "MAINTENANCE";
            case AnomalyType::GEOFENCE_VIOLATION: return "GEOFENCE";
            case AnomalyType::HARSH_ACCELERATION: return "HARSH_ACCEL";
            case AnomalyType::HARSH_BRAKING: return "HARSH_BRAKE";
            default: return "UNKNOWN";
        }
    }
};

// Enhanced vehicle profile with maintenance tracking
struct VehicleProfile {
    int vehicle_id;
    std::string make_model;
    std::string license_plate;
    VehicleState current_state;
    std::chrono::system_clock::time_point last_seen;
    double total_distance_km;
    int total_anomalies;
    double avg_fuel_efficiency;
    std::vector<std::pair<double, double>> route_history;
    
    // Enhanced fields
    std::chrono::system_clock::time_point last_maintenance;
    int maintenance_interval_km = 10000;
    double max_speed_recorded = 0.0;
    double avg_speed = 0.0;
    int harsh_events_count = 0;
    std::map<std::string, double> performance_metrics;
    
    VehicleProfile(int id, const std::string& model = "Unknown Vehicle", 
                   const std::string& plate = "")
        : vehicle_id(id), make_model(model), license_plate(plate),
          current_state(VehicleState::NORMAL),
          last_seen(std::chrono::system_clock::now()),
          total_distance_km(0.0), total_anomalies(0), avg_fuel_efficiency(0.0),
          last_maintenance(std::chrono::system_clock::now() - std::chrono::hours(24*30)) {}
};

// Geofence structure for location-based alerts
struct Geofence {
    std::string name;
    double center_lat;
    double center_lon;
    double radius_km;
    bool is_restricted; // true for restricted areas, false for allowed areas
    
    bool isInside(double lat, double lon) const {
        return haversine(center_lat, center_lon, lat, lon) <= radius_km;
    }
};

// ============================================================================
// MACHINE LEARNING ANOMALY DETECTOR
// ============================================================================

class MLAnomalyDetector {
private:
    struct FeatureVector {
        double speed;
        double rpm;
        double temperature;
        double acceleration;
        double fuel_consumption_rate;
        double time_of_day; // 0-24 hours
        double day_of_week; // 0-6
    };
    
    std::map<int, std::vector<FeatureVector>> training_data;
    std::map<int, std::vector<double>> feature_means;
    std::map<int, std::vector<double>> feature_stds;
    
public:
    void trainModel(int vehicle_id, const std::deque<SensorReading>& historical_data) {
        if (historical_data.size() < 50) return; // Need sufficient data
        
        std::vector<FeatureVector> features;
        for (size_t i = 1; i < historical_data.size(); ++i) {
            const auto& current = historical_data[i];
            const auto& previous = historical_data[i-1];
            
            FeatureVector fv;
            fv.speed = current.speed_kmph;
            fv.rpm = current.rpm;
            fv.temperature = current.engine_temp_celsius;
            fv.acceleration = current.acceleration_ms2;
            
            // Calculate fuel consumption rate
            auto time_diff = std::chrono::duration_cast<std::chrono::seconds>(
                current.timestamp - previous.timestamp).count();
            if (time_diff > 0) {
                fv.fuel_consumption_rate = (previous.fuel_level_percent - current.fuel_level_percent) / time_diff;
            }
            
            // Time features
            auto time_t = std::chrono::system_clock::to_time_t(current.timestamp);
            struct tm* tm_info = std::localtime(&time_t);
            fv.time_of_day = tm_info->tm_hour + tm_info->tm_min / 60.0;
            fv.day_of_week = tm_info->tm_wday;
            
            features.push_back(fv);
        }
        
        training_data[vehicle_id] = features;
        calculateStatistics(vehicle_id);
    }
    
    double calculateAnomalyScore(int vehicle_id, const SensorReading& reading) {
        if (training_data.find(vehicle_id) == training_data.end()) {
            return 0.00; // No training data available
        }
        
        FeatureVector fv;
        fv.speed = reading.speed_kmph;
        fv.rpm = reading.rpm;
        fv.temperature = reading.engine_temp_celsius;
        fv.acceleration = reading.acceleration_ms2;
        
        auto time_t = std::chrono::system_clock::to_time_t(reading.timestamp);
        struct tm* tm_info = std::localtime(&time_t);
        fv.time_of_day = tm_info->tm_hour + tm_info->tm_min / 60.0;
        fv.day_of_week = tm_info->tm_wday;
        
        return calculateMahalanobisDistance(vehicle_id, fv);
    }
    
private:
    void calculateStatistics(int vehicle_id) {
        const auto& data = training_data[vehicle_id];
        if (data.empty()) return;
        
        // Calculate means
        std::vector<double> means(7, 0.0);
        for (const auto& fv : data) {
            means[0] += fv.speed;
            means[1] += fv.rpm;
            means[2] += fv.temperature;
            means[3] += fv.acceleration;
            means[4] += fv.fuel_consumption_rate;
            means[5] += fv.time_of_day;
            means[6] += fv.day_of_week;
        }
        
        for (auto& mean : means) {
            mean /= data.size();
        }
        
        // Calculate standard deviations
        std::vector<double> stds(7, 0.0);
        for (const auto& fv : data) {
            stds[0] += std::pow(fv.speed - means[0], 2);
            stds[1] += std::pow(fv.rpm - means[1], 2);
            stds[2] += std::pow(fv.temperature - means[2], 2);
            stds[3] += std::pow(fv.acceleration - means[3], 2);
            stds[4] += std::pow(fv.fuel_consumption_rate - means[4], 2);
            stds[5] += std::pow(fv.time_of_day - means[5], 2);
            stds[6] += std::pow(fv.day_of_week - means[6], 2);
        }
        
        for (auto& std : stds) {
            std = std::sqrt(std / data.size());
        }
        
        feature_means[vehicle_id] = means;
        feature_stds[vehicle_id] = stds;
    }
    
    double calculateMahalanobisDistance(int vehicle_id, const FeatureVector& fv) {
        const auto& means = feature_means[vehicle_id];
        const auto& stds = feature_stds[vehicle_id];
        
        std::vector<double> normalized(7);
        normalized[0] = (fv.speed - means[0]) / (stds[0] + 1e-6);
        normalized[1] = (fv.rpm - means[1]) / (stds[1] + 1e-6);
        normalized[2] = (fv.temperature - means[2]) / (stds[2] + 1e-6);
        normalized[3] = (fv.acceleration - means[3]) / (stds[3] + 1e-6);
        normalized[4] = (fv.fuel_consumption_rate - means[4]) / (stds[4] + 1e-6);
        normalized[5] = (fv.time_of_day - means[5]) / (stds[5] + 1e-6);
        normalized[6] = (fv.day_of_week - means[6]) / (stds[6] + 1e-6);
        
        double distance = 0.0;
        for (double val : normalized) {
            distance += val * val;
        }
        
        return std::sqrt(distance);
    }
};

// ============================================================================
// ENHANCED ANALYTICS ENGINE
// ============================================================================

class AdvancedAnalytics {
private:
    std::map<int, std::vector<double>> speed_trends;
    std::map<int, std::vector<double>> rpm_trends;
    std::map<int, std::vector<double>> temp_trends;
    std::map<int, std::vector<double>> fuel_trends;
    std::map<int, std::vector<double>> acceleration_trends;
    
public:
    struct Statistics {
        double mean = 0.0;
        double median = 0.0;
        double std_deviation = 0.0;
        double min_val = 0.0;
        double max_val = 0.0;
        double percentile_95 = 0.0;
        double trend_slope = 0.0;
        double coefficient_of_variation = 0.0;
        int outlier_count = 0;
    };
    
    Statistics calculateStatistics(const std::vector<double>& data) {
        Statistics stats = {};
        if (data.empty()) return stats;
        
        std::vector<double> sorted_data = data;
        std::sort(sorted_data.begin(), sorted_data.end());
        size_t n = sorted_data.size();
        
        stats.min_val = sorted_data.front();
        stats.max_val = sorted_data.back();
        stats.mean = std::accumulate(data.begin(), data.end(), 0.0) / n;
        
        stats.median = (n % 2 == 0) ?
            (sorted_data[n/2-1] + sorted_data[n/2]) / 2.0 :
            sorted_data[n/2];
        
        size_t p95_idx = static_cast<size_t>(0.95 * (n - 1));
        stats.percentile_95 = sorted_data[p95_idx];
        
        double variance = 0.0;
        for (double val : data) variance += std::pow(val - stats.mean, 2);
        stats.std_deviation = std::sqrt(variance / n);
        
        stats.coefficient_of_variation = stats.mean != 0 ? 
            stats.std_deviation / std::abs(stats.mean) : 0.0;
        
        // Count outliers (values beyond 2 standard deviations)
        double lower_bound = stats.mean - 2 * stats.std_deviation;
        double upper_bound = stats.mean + 2 * stats.std_deviation;
        stats.outlier_count = std::count_if(data.begin(), data.end(),
            [lower_bound, upper_bound](double val) {
                return val < lower_bound || val > upper_bound;
            });
        
        // Calculate trend slope
        if (n >= 2) {
            double sum_x = 0, sum_y = 0, sum_xy = 0, sum_x2 = 0;
            for (size_t i = 0; i < n; ++i) {
                sum_x += i;
                sum_y += data[i];
                sum_xy += i * data[i];
                sum_x2 += i * i;
            }
            double n_d = static_cast<double>(n);
            double denom = (n_d * sum_x2 - sum_x * sum_x);
            if (denom != 0.0)
                stats.trend_slope = (n_d * sum_xy - sum_x * sum_y) / denom;
        }
        
        return stats;
    }
    
    void updateTrends(int vehicle_id, const SensorReading& reading) {
        const size_t MAX_TREND_SIZE = 200; // Increased for better analysis
        
        auto updateTrend = [MAX_TREND_SIZE](std::vector<double>& trend, double value) {
            trend.push_back(value);
            if (trend.size() > MAX_TREND_SIZE) trend.erase(trend.begin());
        };
        
        updateTrend(speed_trends[vehicle_id], reading.speed_kmph);
        updateTrend(rpm_trends[vehicle_id], reading.rpm);
        updateTrend(temp_trends[vehicle_id], reading.engine_temp_celsius);
        updateTrend(fuel_trends[vehicle_id], reading.fuel_level_percent);
        updateTrend(acceleration_trends[vehicle_id], reading.acceleration_ms2);
    }
    
    Statistics getSpeedStats(int vehicle_id) { return calculateStatistics(speed_trends[vehicle_id]); }
    Statistics getRPMStats(int vehicle_id) { return calculateStatistics(rpm_trends[vehicle_id]); }
    Statistics getTempStats(int vehicle_id) { return calculateStatistics(temp_trends[vehicle_id]); }
    Statistics getFuelStats(int vehicle_id) { return calculateStatistics(fuel_trends[vehicle_id]); }
    Statistics getAccelerationStats(int vehicle_id) { return calculateStatistics(acceleration_trends[vehicle_id]); }
    
    // Predictive analytics
    double predictNextValue(const std::vector<double>& trend) {
        if (trend.size() < 3) return 0.0;
        
        // Simple linear extrapolation
        double slope = (trend.back() - trend[trend.size()-2]);
        return trend.back() + slope;
    }
    
    // Seasonal pattern detection
    std::vector<double> detectSeasonalPattern(const std::vector<double>& data, int period = 24) {
        std::vector<double> seasonal_avg(period, 0.0);
        std::vector<int> seasonal_count(period, 0);
        
        for (size_t i = 0; i < data.size(); ++i) {
            int seasonal_index = i % period;
            seasonal_avg[seasonal_index] += data[i];
            seasonal_count[seasonal_index]++;
        }
        
        for (int i = 0; i < period; ++i) {
            if (seasonal_count[i] > 0) {
                seasonal_avg[i] /= seasonal_count[i];
            }
        }
        
        return seasonal_avg;
    }
};

// ============================================================================
// ENHANCED DATA MANAGER CLASS
// ============================================================================

class AdvancedDataManager {
private:
    static const int WINDOW_SIZE = 200;
    static const int MAX_VEHICLES = 50;
    
    std::unordered_map<int, std::deque<SensorReading>> vehicle_data_windows;
    std::unordered_map<int, std::vector<AnomalyRecord>> detected_anomalies;
    std::unordered_map<int, VehicleProfile> vehicle_profiles;
    std::vector<Geofence> geofences;
    
    std::priority_queue<std::pair<int, int>> anomaly_priority_queue;
    AdvancedAnalytics analytics;
    MLAnomalyDetector ml_detector;
    
    std::mutex data_mutex;
    std::condition_variable data_condition;
    std::atomic<bool> running{true};
    std::atomic<bool> paused{false};
    std::atomic<int> total_readings_processed{0};
    std::atomic<int> total_anomalies_detected{0};
    
    // Enhanced random distributions
    std::random_device rd;
    std::mt19937 gen;
    std::uniform_real_distribution<> speed_dist;
    std::uniform_real_distribution<> rpm_dist;
    std::uniform_real_distribution<> temp_dist;
    std::uniform_real_distribution<> fuel_dist;
    std::uniform_real_distribution<> throttle_dist;
    std::uniform_int_distribution<> vehicle_dist;
    std::uniform_real_distribution<> anomaly_chance;
    std::uniform_real_distribution<> location_dist;
    std::normal_distribution<> acceleration_dist;
    std::uniform_real_distribution<> brake_pressure_dist;
    std::uniform_real_distribution<> oil_pressure_dist;
    std::uniform_real_distribution<> battery_voltage_dist;
    
    std::ofstream data_log_file;
    std::ofstream anomaly_log_file;
    std::ofstream performance_log_file;
    
public:
    AdvancedDataManager() : gen(rd()),
        speed_dist(20.0, 120.0),
        rpm_dist(800.0, 6000.0),
        temp_dist(80.0, 95.0),
        fuel_dist(5.0, 95.0),
        throttle_dist(0.0, 100.0),
        vehicle_dist(1, 20),
        anomaly_chance(0.0, 1.0),
        location_dist(-90.0, 90.0),
        acceleration_dist(0.0, 2.0),
        brake_pressure_dist(0.0, 10.0),
        oil_pressure_dist(2.0, 6.0),
        battery_voltage_dist(11.5, 14.5)
    {
        initializeLogFiles();
        initializeVehicleProfiles();
        initializeGeofences();
    }
    
    ~AdvancedDataManager() {
        running = false;
        data_condition.notify_all();
        closeLogFiles();
    }
    
private:
    void initializeLogFiles() {
        data_log_file.open("enhanced_sensor_data.csv");
        anomaly_log_file.open("enhanced_anomalies.csv");
        performance_log_file.open("system_performance.csv");
        
        if (data_log_file.is_open()) {
            data_log_file << "Timestamp,VehicleID,Speed,RPM,Temperature,FuelLevel,Throttle,EngineOn,Latitude,Longitude,Acceleration,BrakePressure,OilPressure,BatteryVoltage,Odometer,ABSActive,TractionControlActive\n";
        }
        
        if (anomaly_log_file.is_open()) {
            anomaly_log_file << "Timestamp,VehicleID,Sensor,Value,Type,Description,Severity,Priority,Location,MLScore\n";
        }
        
        if (performance_log_file.is_open()) {
            performance_log_file << "Timestamp,TotalReadings,TotalAnomalies,ProcessingTimeMs,MemoryUsageMB\n";
        }
    }
    
    void closeLogFiles() {
        if (data_log_file.is_open()) data_log_file.close();
        if (anomaly_log_file.is_open()) anomaly_log_file.close();
        if (performance_log_file.is_open()) performance_log_file.close();
    }
    
    void initializeVehicleProfiles() {
        std::vector<std::pair<std::string, std::string>> vehicles = {
            {"Honda Civic", "ABC-123"}, {"Toyota Camry", "DEF-456"}, {"Ford F-150", "GHI-789"},
            {"BMW X3", "JKL-012"}, {"Tesla Model 3", "MNO-345"}, {"Chevrolet Silverado", "PQR-678"},
            {"Nissan Altima", "STU-901"}, {"Hyundai Elantra", "VWX-234"}, {"Mercedes C-Class", "YZA-567"},
            {"Audi A4", "BCD-890"}, {"Volkswagen Jetta", "EFG-123"}, {"Subaru Outback", "HIJ-456"},
            {"Mazda CX-5", "KLM-789"}, {"Jeep Wrangler", "NOP-012"}, {"Kia Sorento", "QRS-345"},
            {"Volvo XC90", "TUV-678"}, {"Lexus RX", "WXY-901"}, {"Acura MDX", "ZAB-234"},
            {"Infiniti Q50", "CDE-567"}, {"Cadillac Escalade", "FGH-890"}
        };
        
        for (int i = 1; i <= 20; ++i) {
            vehicle_profiles[i] = VehicleProfile(i, vehicles[i-1].first, vehicles[i-1].second);
        }
    }
    
    void initializeGeofences() {
        // Add some sample geofences
        geofences.push_back({"Downtown Area", 40.7128, -74.0060, 5.0, false});
        geofences.push_back({"Industrial Zone", 40.6892, -74.0445, 3.0, true});
        geofences.push_back({"School Zone", 40.7589, -73.9851, 1.0, true});
        geofences.push_back({"Highway Rest Area", 40.7505, -73.9934, 2.0, false});
    }
    
public:
    void processSensorReading(const SensorReading& reading) {
        auto start_time = std::chrono::high_resolution_clock::now();
        
        std::lock_guard<std::mutex> lock(data_mutex);
        int vehicle_id = reading.vehicle_id;
        total_readings_processed++;
        
        // Update vehicle profile
        if (vehicle_profiles.find(vehicle_id) != vehicle_profiles.end()) {
            updateVehicleProfile(vehicle_id, reading);
        }
        
        // Add to sliding window
        vehicle_data_windows[vehicle_id].push_back(reading);
        if (vehicle_data_windows[vehicle_id].size() > WINDOW_SIZE) {
            vehicle_data_windows[vehicle_id].pop_front();
        }
        
        // Update analytics
        analytics.updateTrends(vehicle_id, reading);
        
        // Train ML model periodically
        if (vehicle_data_windows[vehicle_id].size() >= 100 && 
            total_readings_processed % 100 == 0) {
            ml_detector.trainModel(vehicle_id, vehicle_data_windows[vehicle_id]);
        }
        
        // Detect anomalies
        detectEnhancedAnomalies(reading, vehicle_data_windows[vehicle_id]);
        
        // Check geofences
        checkGeofenceViolations(reading);
        
        // Log data
        if (data_log_file.is_open()) {
            data_log_file << reading.toCSV() << "\n";
            data_log_file.flush();
        }
        
        updateVehicleState(vehicle_id);
        
        // Log performance metrics
        auto end_time = std::chrono::high_resolution_clock::now();
        auto processing_time = std::chrono::duration_cast<std::chrono::microseconds>(
            end_time - start_time).count() / 1000.0; // Convert to milliseconds
        
        if (performance_log_file.is_open() && total_readings_processed % 100 == 0) {
            performance_log_file << formatTimestamp(std::chrono::system_clock::now()) << ","
                                << total_readings_processed << ","
                                << total_anomalies_detected << ","
                                << processing_time << ","
                                << "0" << "\n"; // Memory usage placeholder
            performance_log_file.flush();
        }
    }
    
private:
    void updateVehicleProfile(int vehicle_id, const SensorReading& reading) {
        auto& profile = vehicle_profiles[vehicle_id];
        profile.last_seen = reading.timestamp;
        
        // Update distance and route
        if (!profile.route_history.empty()) {
            auto last_pos = profile.route_history.back();
            double distance = haversine(reading.latitude, reading.longitude, 
                                      last_pos.first, last_pos.second);
            profile.total_distance_km += distance;
        }
        
        profile.route_history.emplace_back(reading.latitude, reading.longitude);
        if (profile.route_history.size() > 1000) {
            profile.route_history.erase(profile.route_history.begin());
        }
        
        // Update performance metrics
        profile.max_speed_recorded = std::max(profile.max_speed_recorded, reading.speed_kmph);
        
        // Update average speed (simple moving average)
        if (profile.performance_metrics.find("total_speed_sum") == profile.performance_metrics.end()) {
            profile.performance_metrics["total_speed_sum"] = 0.0;
            profile.performance_metrics["speed_count"] = 0.0;
        }
        
        profile.performance_metrics["total_speed_sum"] += reading.speed_kmph;
        profile.performance_metrics["speed_count"] += 1.0;
        profile.avg_speed = profile.performance_metrics["total_speed_sum"] / 
                           profile.performance_metrics["speed_count"];
        
        // Check for harsh events
        if (std::abs(reading.acceleration_ms2) > 4.0) { // Harsh acceleration/braking
            profile.harsh_events_count++;
        }
    }
    
    void checkGeofenceViolations(const SensorReading& reading) {
        for (const auto& geofence : geofences) {
            bool inside = geofence.isInside(reading.latitude, reading.longitude);
            
            if (geofence.is_restricted && inside) {
                addEnhancedAnomaly(reading.vehicle_id, "location", 0.0,
                    AnomalyType::GEOFENCE_VIOLATION,
                    "Vehicle entered restricted area: " + geofence.name,
                    4, geofence.name);
            }
        }
    }
    
    bool detectEnhancedAnomalies(const SensorReading& current, 
                                const std::deque<SensorReading>& window) {
        bool anomaly_found = false;
        
        // Get ML anomaly score
        double ml_score = ml_detector.calculateAnomalyScore(current.vehicle_id, current);
        
        // Enhanced range-based detection
        if (current.speed_kmph > 200.0 || current.speed_kmph < -5.0) {
            addEnhancedAnomaly(current.vehicle_id, "speed", current.speed_kmph,
                AnomalyType::SPEED_OUT_OF_RANGE, "Speed outside safe range", 4, "", ml_score);
            anomaly_found = true;
        }
        
        if (current.rpm > 8000.0 || (current.rpm < 400.0 && current.engine_on && current.speed_kmph > 10.0)) {
            addEnhancedAnomaly(current.vehicle_id, "rpm", current.rpm,
                AnomalyType::RPM_OUT_OF_RANGE, "RPM outside normal range", 3, "", ml_score);
            anomaly_found = true;
        }
        
        if (current.engine_temp_celsius > 110.0) {
            addEnhancedAnomaly(current.vehicle_id, "temperature", current.engine_temp_celsius,
                AnomalyType::TEMP_OUT_OF_RANGE, "Engine overheating detected", 5, "", ml_score);
            anomaly_found = true;
        }
        
        // Enhanced acceleration-based detection
        if (std::abs(current.acceleration_ms2) > 6.0) {
            AnomalyType type = current.acceleration_ms2 > 0 ? 
                AnomalyType::HARSH_ACCELERATION : AnomalyType::HARSH_BRAKING;
            std::string desc = current.acceleration_ms2 > 0 ? 
                "Harsh acceleration detected" : "Harsh braking detected";
            
            addEnhancedAnomaly(current.vehicle_id, "acceleration", current.acceleration_ms2,
                type, desc, 3, "", ml_score);
            anomaly_found = true;
        }
        
        // Oil pressure monitoring
        if (current.oil_pressure_bar < 1.0 && current.engine_on) {
            addEnhancedAnomaly(current.vehicle_id, "oil_pressure", current.oil_pressure_bar,
                AnomalyType::SENSOR_FAILURE, "Critically low oil pressure", 5, "", ml_score);
            anomaly_found = true;
        }
        
        // Battery voltage monitoring
        if (current.battery_voltage < 11.0 || current.battery_voltage > 15.0) {
            addEnhancedAnomaly(current.vehicle_id, "battery", current.battery_voltage,
                AnomalyType::SENSOR_FAILURE, "Battery voltage abnormal", 3, "", ml_score);
            anomaly_found = true;
        }
        
        // Fuel leak detection
        if (window.size() >= 10) {
            double fuel_drop_rate = calculateFuelDropRate(window);
            if (fuel_drop_rate > 2.0) { // More than 2% per minute
                addEnhancedAnomaly(current.vehicle_id, "fuel", fuel_drop_rate,
                    AnomalyType::FUEL_LEAK, "Potential fuel leak detected", 4, "", ml_score);
                anomaly_found = true;
            }
        }
        
        // ML-based anomaly detection
        if (ml_score > 3.0) { // Threshold for ML anomaly
            addEnhancedAnomaly(current.vehicle_id, "ml_pattern", ml_score,
                AnomalyType::ERRATIC_BEHAVIOR, "ML detected unusual pattern", 3, "", ml_score);
            anomaly_found = true;
        }
        
        // Maintenance prediction
        checkMaintenanceRequirements(current);
        
        return anomaly_found;
    }
    
    double calculateFuelDropRate(const std::deque<SensorReading>& window) {
        if (window.size() < 10) return 0.0;
        
        const auto& oldest = window[window.size() - 10];
        const auto& newest = window.back();
        
        auto time_diff = std::chrono::duration_cast<std::chrono::minutes>(
            newest.timestamp - oldest.timestamp).count();
        
        if (time_diff <= 0) return 0.0;
        
        double fuel_drop = oldest.fuel_level_percent - newest.fuel_level_percent;
        return fuel_drop / time_diff; // Percent per minute
    }
    
    void checkMaintenanceRequirements(const SensorReading& reading) {
        auto& profile = vehicle_profiles[reading.vehicle_id];
        
        // Check if maintenance is due based on distance
        auto time_since_maintenance = std::chrono::duration_cast<std::chrono::hours>(
            reading.timestamp - profile.last_maintenance).count();
        
        if (profile.total_distance_km > profile.maintenance_interval_km || 
            time_since_maintenance > 24 * 30 * 3) { // 3 months
            
            addEnhancedAnomaly(reading.vehicle_id, "maintenance", profile.total_distance_km,
                AnomalyType::MAINTENANCE_REQUIRED, "Scheduled maintenance due", 2);
            
            profile.current_state = VehicleState::MAINTENANCE;
        }
    }
    
    void addEnhancedAnomaly(int vehicle_id, const std::string& sensor, double value,
                           AnomalyType type, const std::string& description, 
                           int severity, const std::string& location = "", 
                           double ml_score = 0.0) {
        AnomalyRecord anomaly(vehicle_id, sensor, value, type, description, severity, location);
        detected_anomalies[vehicle_id].push_back(anomaly);
        total_anomalies_detected++;
        
        if (severity >= 4) {
            anomaly_priority_queue.push({severity, vehicle_id});
        }
        
        if (vehicle_profiles.find(vehicle_id) != vehicle_profiles.end()) {
            vehicle_profiles[vehicle_id].total_anomalies++;
        }
        
        // Enhanced logging with ML score
        if (anomaly_log_file.is_open()) {
            anomaly_log_file << anomaly.getTimestampString() << ","
                << vehicle_id << ","
                << sensor << ","
                << std::fixed << std::setprecision(2) << value << ","
                << anomaly.getTypeString() << ","
                << description << ","
                << severity << ","
                << static_cast<int>(anomaly.priority) << ","
                << location << ","
                << ml_score << "\n";
            anomaly_log_file.flush();
        }
    }
    
    void updateVehicleState(int vehicle_id) {
        if (vehicle_profiles.find(vehicle_id) == vehicle_profiles.end()) return;
        
        auto& profile = vehicle_profiles[vehicle_id];
        int recent_critical = 0, recent_high = 0;
        auto now = std::chrono::system_clock::now();
        
        if (detected_anomalies.find(vehicle_id) != detected_anomalies.end()) {
            for (const auto& anomaly : detected_anomalies[vehicle_id]) {
                auto time_diff = std::chrono::duration_cast<std::chrono::minutes>(
                    now - anomaly.timestamp);
                if (time_diff.count() <= 5) {
                    if (anomaly.severity == 5) recent_critical++;
                    else if (anomaly.severity == 4) recent_high++;
                }
            }
        }
        
        if (recent_critical > 0) profile.current_state = VehicleState::CRITICAL;
        else if (recent_high > 2) profile.current_state = VehicleState::WARNING;
        else if (profile.current_state != VehicleState::MAINTENANCE) 
            profile.current_state = VehicleState::NORMAL;
        
        auto since_last = std::chrono::duration_cast<std::chrono::seconds>(
            now - profile.last_seen);
        if (since_last.count() > 30) profile.current_state = VehicleState::OFFLINE;
    }
    
public:
    // Enhanced reporting methods
    void printEnhancedAnalytics(int vehicle_id) {
        std::lock_guard<std::mutex> lock(data_mutex);
        
        if (vehicle_data_windows.find(vehicle_id) == vehicle_data_windows.end() || 
            vehicle_data_windows[vehicle_id].empty()) {
            std::cout << "Vehicle ID " << vehicle_id << " not found or no data available.\n";
            return;
        }
        
        auto speed_stats = analytics.getSpeedStats(vehicle_id);
        auto rpm_stats = analytics.getRPMStats(vehicle_id);
        auto temp_stats = analytics.getTempStats(vehicle_id);
        auto fuel_stats = analytics.getFuelStats(vehicle_id);
        auto accel_stats = analytics.getAccelerationStats(vehicle_id);
        auto& profile = vehicle_profiles[vehicle_id];
        
        std::cout << "\n=== ENHANCED ANALYTICS FOR VEHICLE " << vehicle_id << " ===\n";
        std::cout << "Model: " << profile.make_model << " (" << profile.license_plate << ")\n";
        std::cout << "Current State: " << getStateString(profile.current_state) << "\n";
        std::cout << "Total Distance: " << std::fixed << std::setprecision(2) 
                  << profile.total_distance_km << " km\n";
        std::cout << "Average Speed: " << profile.avg_speed << " km/h\n";
        std::cout << "Max Speed Recorded: " << profile.max_speed_recorded << " km/h\n";
        std::cout << "Harsh Events: " << profile.harsh_events_count << "\n";
        std::cout << "Data Points: " << vehicle_data_windows[vehicle_id].size() << "\n";
        
        std::cout << "\n--- SPEED ANALYTICS ---\n";
        printStatistics("Speed", speed_stats, "km/h");
        
        std::cout << "\n--- RPM ANALYTICS ---\n";
        printStatistics("RPM", rpm_stats, "RPM");
        
        std::cout << "\n--- TEMPERATURE ANALYTICS ---\n";
        printStatistics("Temperature", temp_stats, "°C");
        
        std::cout << "\n--- FUEL ANALYTICS ---\n";
        printStatistics("Fuel", fuel_stats, "%");
        
        std::cout << "\n--- ACCELERATION ANALYTICS ---\n";
        printStatistics("Acceleration", accel_stats, "m/s²");
        
        std::cout << "\n--- ANOMALY SUMMARY ---\n";
        std::cout << "Total Anomalies: " << profile.total_anomalies << "\n";
        
        if (detected_anomalies.find(vehicle_id) != detected_anomalies.end()) {
            std::map<int, int> severity_count;
            std::map<AnomalyType, int> type_count;
            
            for (const auto& anomaly : detected_anomalies[vehicle_id]) {
                severity_count[anomaly.severity]++;
                type_count[anomaly.type]++;
            }
            
            std::cout << "By Severity:\n";
            for (const auto& pair : severity_count) {
                std::cout << "  Level " << pair.first << ": " << pair.second << "\n";
            }
            
            std::cout << "By Type:\n";
            for (const auto& pair : type_count) {
                AnomalyRecord temp(0, "", 0, pair.first, "", 0);
                std::cout << "  " << temp.getTypeString() << ": " << pair.second << "\n";
            }
        }
        
        // Predictive insights
        std::cout << "\n--- PREDICTIVE INSIGHTS ---\n";
        auto speed_trend = analytics.getSpeedStats(vehicle_id);
        if (speed_trend.trend_slope > 0.1) {
            std::cout << "⚠️  Speed trend increasing (+" << speed_trend.trend_slope << " km/h per reading)\n";
        } else if (speed_trend.trend_slope < -0.1) {
            std::cout << "📉 Speed trend decreasing (" << speed_trend.trend_slope << " km/h per reading)\n";
        }
        
        auto temp_trend = analytics.getTempStats(vehicle_id);
        if (temp_trend.trend_slope > 0.05) {
            std::cout << "🌡️  Temperature rising trend (+" << temp_trend.trend_slope << "°C per reading)\n";
        }
        
        if (profile.total_distance_km > profile.maintenance_interval_km * 0.9) {
            std::cout << "🔧 Maintenance due soon (" 
                      << (profile.maintenance_interval_km - profile.total_distance_km) 
                      << " km remaining)\n";
        }
    }
    
private:
    void printStatistics(const std::string& name, const AdvancedAnalytics::Statistics& stats, 
                        const std::string& unit) {
        std::cout << std::fixed << std::setprecision(2);
        std::cout << name << " - Mean: " << stats.mean << unit 
                  << ", Std Dev: " << stats.std_deviation << unit
                  << ", CV: " << stats.coefficient_of_variation
                  << ", Outliers: " << stats.outlier_count
                  << ", Trend: " << stats.trend_slope << "\n";
    }
    
    std::string getStateString(VehicleState state) const {
        switch (state) {
            case VehicleState::NORMAL: return "NORMAL";
            case VehicleState::WARNING: return "WARNING";
            case VehicleState::CRITICAL: return "CRITICAL";
            case VehicleState::OFFLINE: return "OFFLINE";
            case VehicleState::MAINTENANCE: return "MAINTENANCE";
            default: return "UNKNOWN";
        }
    }
    
public:
    // Enhanced synthetic data generation
    SensorReading generateEnhancedSyntheticReading(int vehicle_id, int anomaly_scenario = 0) {
        double speed = speed_dist(gen);
        double rpm = rpm_dist(gen);
        double temp = temp_dist(gen);
        double fuel = fuel_dist(gen);
        double throttle = throttle_dist(gen);
        bool engine_on = true;
        double lat = location_dist(gen);
        double lon = location_dist(gen);
        double acceleration = acceleration_dist(gen);
        double brake_pressure = brake_pressure_dist(gen);
        double oil_pressure = oil_pressure_dist(gen);
        double battery_voltage = battery_voltage_dist(gen);
        int odometer = 0;
        bool abs_active = false;
        bool traction_control = false;
        
        // Apply continuity from previous reading
        if (vehicle_data_windows.count(vehicle_id) && !vehicle_data_windows[vehicle_id].empty()) {
            const SensorReading& last = vehicle_data_windows[vehicle_id].back();
            
            // Smooth transitions
            speed = std::max(0.0, last.speed_kmph + std::normal_distribution<>(0, 3)(gen));
            rpm = std::max(0.0, last.rpm + std::normal_distribution<>(0, 150)(gen));
            temp = std::max(0.0, last.engine_temp_celsius + std::normal_distribution<>(0, 0.5)(gen));
            fuel = std::max(0.0, std::min(100.0, last.fuel_level_percent - 0.05));
            
            // Calculate realistic acceleration
            auto time_diff = 1.0; // Assume 1 second between readings
            acceleration = (speed - last.speed_kmph) / 3.6 / time_diff; // Convert km/h to m/s
            
            odometer = last.odometer_km + static_cast<int>(speed / 3600.0); // Rough distance
            
            // Location continuity
            double bearing = std::uniform_real_distribution<>(0.0, 360.0)(gen);
            double dist_km = speed * (1.0 / 3600.0);
            lat = last.latitude + (dist_km / 111.0) * std::cos(deg2rad(bearing));
            lon = last.longitude + (dist_km / (111.0 * std::cos(deg2rad(last.latitude)))) * std::sin(deg2rad(bearing));
            
            // Safety systems activation
            if (std::abs(acceleration) > 3.0) {
                abs_active = std::bernoulli_distribution(0.3)(gen);
                traction_control = std::bernoulli_distribution(0.2)(gen);
            }
        }
        
        // Apply anomaly scenarios
        if (anomaly_scenario > 0) {
            applyAnomalyScenario(anomaly_scenario, speed, rpm, temp, fuel, throttle, 
                               engine_on, acceleration, brake_pressure, oil_pressure, 
                               battery_voltage, abs_active, traction_control, vehicle_id);
        }
        
        SensorReading reading(vehicle_id, speed, rpm, temp, fuel, throttle, engine_on, lat, lon);
        reading.acceleration_ms2 = acceleration;
        reading.brake_pressure_bar = brake_pressure;
        reading.oil_pressure_bar = oil_pressure;
        reading.battery_voltage = battery_voltage;
        reading.odometer_km = odometer;
        reading.abs_active = abs_active;
        reading.traction_control_active = traction_control;
        
        return reading;
    }
    
private:
    void applyAnomalyScenario(int scenario, double& speed, double& rpm, double& temp, 
                             double& fuel, double& throttle, bool& engine_on,
                             double& acceleration, double& brake_pressure, 
                             double& oil_pressure, double& battery_voltage,
                             bool& abs_active, bool& traction_control, int vehicle_id) {
        switch (scenario) {
            case 1: // Extreme speed
                speed = 250.0 + std::uniform_real_distribution<>(0, 50)(gen);
                break;
            case 2: // Engine overrev
                rpm = 9000.0 + std::uniform_real_distribution<>(0, 2000)(gen);
                break;
            case 3: // Overheating
                temp = 120.0 + std::uniform_real_distribution<>(0, 20)(gen);
                break;
            case 4: // Sensor failure
                speed = -10.0;
                break;
            case 5: // Engine stall
                engine_on = false;
                rpm = 0.0;
                speed = 0.0;
                break;
            case 6: // Harsh acceleration
                acceleration = 8.0 + std::uniform_real_distribution<>(0, 4)(gen);
                abs_active = true;
                traction_control = true;
                break;
            case 7: // Harsh braking
                acceleration = -8.0 - std::uniform_real_distribution<>(0, 4)(gen);
                brake_pressure = 15.0 + std::uniform_real_distribution<>(0, 5)(gen);
                abs_active = true;
                break;
            case 8: // Low oil pressure
                oil_pressure = 0.5 + std::uniform_real_distribution<>(0, 0.3)(gen);
                break;
            case 9: // Battery issues
                battery_voltage = 9.0 + std::uniform_real_distribution<>(0, 1)(gen);
                break;
            case 10: // Fuel leak
                if (vehicle_data_windows.count(vehicle_id) && !vehicle_data_windows[vehicle_id].empty()) {
                    fuel = vehicle_data_windows[vehicle_id].back().fuel_level_percent - 5.0;
                }
                break;
        }
    }
    
public:
    // System control methods
    void setRunning(bool r) { running.store(r); }
    void setPaused(bool p) { paused.store(p); }
    bool getPaused() const { return paused.load(); }
    bool getRunning() const { return running.load(); }
    int getTotalReadingsProcessed() const { return total_readings_processed.load(); }
    int getTotalAnomaliesDetected() const { return total_anomalies_detected.load(); }
    
    std::vector<int> getActiveVehicleIds() {
        std::lock_guard<std::mutex> lock(data_mutex);
        std::vector<int> ids;
        for (const auto& p : vehicle_profiles) { 
            ids.push_back(p.first); 
        }
        return ids;
    }
    
    void printSystemStatus() {
        std::lock_guard<std::mutex> lock(data_mutex);
        std::cout << "\n=== SYSTEM STATUS ===\n";
        std::cout << "Running: " << (running ? "Yes" : "No") << "\n";
        std::cout << "Paused: " << (paused ? "Yes" : "No") << "\n";
        std::cout << "Total Readings: " << total_readings_processed << "\n";
        std::cout << "Total Anomalies: " << total_anomalies_detected << "\n";
        std::cout << "Active Vehicles: " << vehicle_profiles.size() << "\n";
        std::cout << "Geofences: " << geofences.size() << "\n";
        
        // Memory usage estimation
        size_t memory_usage = 0;
        for (const auto& pair : vehicle_data_windows) {
            memory_usage += pair.second.size() * sizeof(SensorReading);
        }
        for (const auto& pair : detected_anomalies) {
            memory_usage += pair.second.size() * sizeof(AnomalyRecord);
        }
        
        std::cout << "Estimated Memory Usage: " << memory_usage / 1024 / 1024 << " MB\n";
    }
    
    void exportSystemReport(const std::string& filename) {
        std::lock_guard<std::mutex> lock(data_mutex);
        std::ofstream report(filename);
        
        if (!report.is_open()) {
            std::cerr << "Error: Could not create report file " << filename << "\n";
            return;
        }
        
        report << "=== VEHICLE TELEMATICS SYSTEM REPORT ===\n";
        report << "Generated: " << formatTimestamp(std::chrono::system_clock::now()) << "\n\n";
        
        report << "SYSTEM OVERVIEW:\n";
        report << "Total Readings Processed: " << total_readings_processed << "\n";
        report << "Total Anomalies Detected: " << total_anomalies_detected << "\n";
        report << "Active Vehicles: " << vehicle_profiles.size() << "\n\n";
        
        report << "VEHICLE SUMMARY:\n";
        for (const auto& pair : vehicle_profiles) {
            const auto& profile = pair.second;
            report << "Vehicle " << pair.first << " (" << profile.make_model << "):\n";
            report << "  State: " << getStateString(profile.current_state) << "\n";
            report << "  Distance: " << profile.total_distance_km << " km\n";
            report << "  Anomalies: " << profile.total_anomalies << "\n";
            report << "  Harsh Events: " << profile.harsh_events_count << "\n\n";
        }
        
        std::cout << "System report exported to " << filename << "\n";
    }
};

// ============================================================================
// ENHANCED SIMULATION THREAD
// ============================================================================

void enhanced_simulation_thread(AdvancedDataManager& data_manager) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> vehicle_dist(1, 20);
    std::uniform_real_distribution<> anomaly_chance(0.0, 1.0);
    std::uniform_int_distribution<> anomaly_type_dist(1, 10);
    
    int reading_count = 0;
    auto last_status_time = std::chrono::steady_clock::now();
    
    while (data_manager.getRunning()) {
        if (data_manager.getPaused()) {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
            continue;
        }
        
        int vehicle_id = vehicle_dist(gen);
        int anomaly_scenario = 0;
        
        // 3% chance of anomaly injection
        if (anomaly_chance(gen) < 0.03) {
            anomaly_scenario = anomaly_type_dist(gen);
        }
        
        SensorReading reading = data_manager.generateEnhancedSyntheticReading(vehicle_id, anomaly_scenario);
        data_manager.processSensorReading(reading);
        
        reading_count++;
        
        // Progress indicator
        if (reading_count % 50 == 0) {
            std::cout << ".";
            std::cout.flush();
        }
        
        // Periodic status update
        auto now = std::chrono::steady_clock::now();
        if (std::chrono::duration_cast<std::chrono::minutes>(now - last_status_time).count() >= 1) {
            std::cout << "\n[" << formatTimestamp(std::chrono::system_clock::now()) 
                      << "] Processed: " << data_manager.getTotalReadingsProcessed() 
                      << " readings, Detected: " << data_manager.getTotalAnomaliesDetected() 
                      << " anomalies\n";
            last_status_time = now;
        }
        
        std::this_thread::sleep_for(std::chrono::milliseconds(50)); // 20 readings per second
    }
    
    std::cout << "\nEnhanced simulation thread stopped.\n";
}

// ============================================================================
// ENHANCED MAIN APPLICATION
// ============================================================================

int main() {
    std::cout << "🚗 Starting Enhanced Vehicle Telematics Anomaly Detection System...\n";
    std::cout << "Features: ML Detection, Geofencing, Predictive Analytics, Enhanced Logging\n\n";
    
    AdvancedDataManager data_manager;
    std::thread sim_thread(enhanced_simulation_thread, std::ref(data_manager));
    
    std::cout << "Initializing system and generating baseline data...\n";
    std::this_thread::sleep_for(std::chrono::seconds(5));
    
    std::cout << "\n=== ENHANCED COMMAND INTERFACE ===\n";
    std::cout << "Available commands:\n";
    std::cout << "  analytics <id>     - Enhanced analytics for vehicle\n";
    std::cout << "  anomalies <id>     - List anomalies for vehicle\n";
    std::cout << "  critical           - Show critical alerts\n";
    std::cout << "  status             - System status and performance\n";
    std::cout << "  vehicles           - List all vehicles\n";
    std::cout << "  report <filename>  - Export system report\n";
    std::cout << "  pause/resume       - Control simulation\n";
    std::cout << "  help               - Show this help\n";
    std::cout << "  quit               - Exit application\n\n";
    
    std::string command;
    while (true) {
        std::cout << "🔧 Enter command: ";
        std::cin >> command;
        
        if (command == "analytics") {
            int vehicle_id;
            std::cin >> vehicle_id;
            data_manager.printEnhancedAnalytics(vehicle_id);
        } else if (command == "anomalies") {
            int vehicle_id;
            std::cin >> vehicle_id;
            // Print all anomalies for the specified vehicle
            std::cout << "Fetching anomalies for vehicle " << vehicle_id << "...\n";
        } else if (command == "critical") {
            std::cout << "Displaying critical alerts from all vehicles...\n";
            // Implementation for critical alerts display
        } else if (command == "status") {
            data_manager.printSystemStatus();
        } else if (command == "vehicles") {
            auto vehicle_ids = data_manager.getActiveVehicleIds();
            std::cout << "\n=== ACTIVE VEHICLES ===\n";
            for (int id : vehicle_ids) {
                std::cout << "Vehicle " << id << "\n";
            }
        } else if (command == "report") {
            std::string filename;
            std::cin >> filename;
            data_manager.exportSystemReport(filename);
        } else if (command == "pause") {
            data_manager.setPaused(true);
            std::cout << "✅ Simulation paused.\n";
        } else if (command == "resume") {
            data_manager.setPaused(false);
            std::cout << "▶️  Simulation resumed.\n";
        } else if (command == "help") {
            std::cout << "\n=== ENHANCED COMMAND INTERFACE ===\n";
            std::cout << "Available commands:\n";
            std::cout << "  analytics <id>     - Enhanced analytics for vehicle\n";
            std::cout << "  anomalies <id>     - List anomalies for vehicle\n";
            std::cout << "  critical           - Show critical alerts\n";
            std::cout << "  status             - System status and performance\n";
            std::cout << "  vehicles           - List all vehicles\n";
            std::cout << "  report <filename>  - Export system report\n";
            std::cout << "  pause/resume       - Control simulation\n";
            std::cout << "  help               - Show this help\n";
            std::cout << "  quit               - Exit application\n\n";
        } else if (command == "quit") {
            std::cout << "🛑 Shutting down enhanced telematics system...\n";
            data_manager.setRunning(false);
            break;
        } else {
            std::cout << "❌ Unknown command. Type 'help' for available commands.\n";
        }
    }
    
    std::cout << "Waiting for simulation thread to complete...\n";
    sim_thread.join();
    
    std::cout << "\n🎯 Enhanced Vehicle Telematics System shutdown complete.\n";
    std::cout << "Final Statistics:\n";
    std::cout << "  Total Readings: " << data_manager.getTotalReadingsProcessed() << "\n";
    std::cout << "  Total Anomalies: " << data_manager.getTotalAnomaliesDetected() << "\n";
    std::cout << "Thank you for using the Enhanced Vehicle Telematics System!\n";
    
    return 0;
}
