export interface JavaFileSnippet {
  fileName: string;
  className: string;
  description: string;
  oopConcepts: string[];
  code: string;
}

export const JAVA_OOP_ARCHITECTURE_FILES: JavaFileSnippet[] = [
  {
    fileName: 'Equipment.java',
    className: 'Equipment',
    description: 'Abstract Base Class defining encapsulated state, invariant checks, and polymorphic abstract contracts.',
    oopConcepts: ['Abstraction', 'Encapsulation', 'Polymorphism', 'Template Method Pattern'],
    code: `package com.volttrack.lab.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Abstract Base Class for all Electronics Lab Equipment.
 * Demonstrates encapsulation with private fields, invariant checking, and polymorphism.
 */
public abstract class Equipment {
    private final String id;
    private final String assetTag;
    private String name;
    private final String manufacturer;
    private final String model;
    private final String serialNumber;
    private final EquipmentCategory category;
    private EquipmentStatus status;
    private String location;
    private double powerRatingWatts;
    private LocalDate lastCalibrationDate;
    private int calibrationIntervalDays;
    private double totalUsageHours;
    private int healthScore;
    private ActiveSession activeSession;
    private String notes;

    public Equipment(String assetTag, String name, String manufacturer, String model,
                     String serialNumber, EquipmentCategory category, String location,
                     double powerRatingWatts, LocalDate lastCalibrationDate,
                     int calibrationIntervalDays, double totalUsageHours) {
        if (assetTag == null || assetTag.isBlank()) {
            throw new IllegalArgumentException("Asset tag cannot be null or empty");
        }
        this.id = UUID.randomUUID().toString();
        this.assetTag = assetTag;
        this.name = name;
        this.manufacturer = manufacturer;
        this.model = model;
        this.serialNumber = serialNumber;
        this.category = category;
        this.location = location;
        this.powerRatingWatts = powerRatingWatts;
        this.lastCalibrationDate = lastCalibrationDate;
        this.calibrationIntervalDays = calibrationIntervalDays;
        this.totalUsageHours = totalUsageHours;
        this.healthScore = 100;
        this.status = isCalibrationOverdue() ? EquipmentStatus.CALIBRATION_OVERDUE : EquipmentStatus.AVAILABLE;
    }

    // --- Polymorphic Abstract Methods ---
    public abstract Map<String, Object> getDetailedSpecs();
    public abstract List<String> getSafetyChecklist();
    public abstract SelfTestResult runSelfTest();

    // --- Concrete Methods & Business Logic ---
    public double calculatePowerConsumptionKWh(double hours) {
        return (this.powerRatingWatts * hours) / 1000.0;
    }

    public synchronized ActiveSession checkOut(String userName, UserRole role, 
                                              String project, String benchLocation, 
                                              double expectedHours, String notes) {
        if (this.status == EquipmentStatus.IN_USE) {
            throw new IllegalStateException("Equipment " + assetTag + " is already in use.");
        }
        if (this.status == EquipmentStatus.UNDER_MAINTENANCE) {
            throw new IllegalStateException("Equipment " + assetTag + " is under maintenance.");
        }

        ActiveSession session = new ActiveSession(
            UUID.randomUUID().toString(),
            this.id,
            userName,
            role,
            project,
            benchLocation,
            LocalDateTime.now(),
            expectedHours,
            notes
        );

        this.activeSession = session;
        this.status = EquipmentStatus.IN_USE;
        this.location = benchLocation;
        return session;
    }

    public synchronized UsageLog returnEquipment(String returnNotes, boolean faultReported, String faultDetails) {
        if (this.activeSession == null) {
            throw new IllegalStateException("No active checkout session exists for " + this.assetTag);
        }

        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(this.activeSession.startTime(), now);
        if (minutes < 1) minutes = 1;
        double hours = minutes / 60.0;
        this.totalUsageHours += hours;

        UsageLog log = new UsageLog(
            "LOG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
            this.id,
            this.name,
            this.assetTag,
            this.category,
            this.activeSession.userName(),
            this.activeSession.userRole(),
            this.activeSession.projectName(),
            this.activeSession.benchLocation(),
            this.activeSession.startTime(),
            now,
            minutes,
            calculatePowerConsumptionKWh(hours),
            faultReported,
            faultDetails,
            returnNotes
        );

        this.activeSession = null;
        if (faultReported) {
            this.status = EquipmentStatus.UNDER_MAINTENANCE;
            this.healthScore = Math.max(20, this.healthScore - 30);
        } else if (isCalibrationOverdue()) {
            this.status = EquipmentStatus.CALIBRATION_OVERDUE;
        } else {
            this.status = EquipmentStatus.AVAILABLE;
        }

        return log;
    }

    public boolean isCalibrationOverdue() {
        return ChronoUnit.DAYS.between(lastCalibrationDate, LocalDate.now()) > calibrationIntervalDays;
    }

    public void recordCalibration(String certificateNo, String technician) {
        this.lastCalibrationDate = LocalDate.now();
        this.healthScore = Math.min(100, this.healthScore + 15);
        if (this.status == EquipmentStatus.CALIBRATION_OVERDUE) {
            this.status = (this.activeSession != null) ? EquipmentStatus.IN_USE : EquipmentStatus.AVAILABLE;
        }
    }

    // --- Getters ---
    public String getId() { return id; }
    public String getAssetTag() { return assetTag; }
    public String getName() { return name; }
    public String getManufacturer() { return manufacturer; }
    public String getModel() { return model; }
    public String getSerialNumber() { return serialNumber; }
    public EquipmentCategory getCategory() { return category; }
    public EquipmentStatus getStatus() { return status; }
    public String getLocation() { return location; }
    public double getPowerRatingWatts() { return powerRatingWatts; }
    public LocalDate getLastCalibrationDate() { return lastCalibrationDate; }
    public int getCalibrationIntervalDays() { return calibrationIntervalDays; }
    public double getTotalUsageHours() { return totalUsageHours; }
    public int getHealthScore() { return healthScore; }
    public ActiveSession getActiveSession() { return activeSession; }
    public String getNotes() { return notes; }
}`
  },
  {
    fileName: 'Oscilloscope.java',
    className: 'Oscilloscope',
    description: 'Concrete subclass specializing Equipment with channel architecture, sampling rates, and probe safety checks.',
    oopConcepts: ['Inheritance (Subclassing)', 'Method Overriding', 'Specialization'],
    code: `package com.volttrack.lab.model;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Specialized Oscilloscope Instrument inheriting from Equipment.
 */
public class Oscilloscope extends Equipment {
    private final int bandwidthMHz;
    private final int channels;
    private final double sampleRateGSa;
    private final int memoryDepthMpts;

    public Oscilloscope(String assetTag, String name, String manufacturer, String model,
                        String serialNumber, String location, double powerRatingWatts,
                        LocalDate lastCalDate, int calIntervalDays, double totalHours,
                        int bandwidthMHz, int channels, double sampleRateGSa, int memoryDepthMpts) {
        super(assetTag, name, manufacturer, model, serialNumber, EquipmentCategory.OSCILLOSCOPE,
              location, powerRatingWatts, lastCalDate, calIntervalDays, totalHours);
        this.bandwidthMHz = bandwidthMHz;
        this.channels = channels;
        this.sampleRateGSa = sampleRateGSa;
        this.memoryDepthMpts = memoryDepthMpts;
    }

    @Override
    public Map<String, Object> getDetailedSpecs() {
        return Map.of(
            "bandwidthMHz", bandwidthMHz,
            "channels", channels,
            "sampleRateGSa", sampleRateGSa,
            "memoryDepthMpts", memoryDepthMpts,
            "verticalResolution", "8-bit ADC / 12-bit High-Res",
            "triggerTypes", "Edge, Pulse, Pattern, Video, Timeout"
        );
    }

    @Override
    public List<String> getSafetyChecklist() {
        return List.of(
            "Ensure BNC ground alligator clips connect strictly to circuit GND.",
            "Match probe attenuation switch (1X / 10X) with channel scale setting.",
            "Do not exceed maximum input voltage (300V CAT I / 400Vpk).",
            "Use isolated differential probes for floating/mains power stage analysis."
        );
    }

    @Override
    public SelfTestResult runSelfTest() {
        boolean pass = channels > 0 && sampleRateGSa > 0;
        return new SelfTestResult(
            pass,
            "ADC self-calibration completed across " + channels + " channels. Trigger baseline verified.",
            Map.of("ch1OffsetMv", 0.12, "ch2OffsetMv", -0.08, "clockJitterPs", 4.2)
        );
    }

    public int getBandwidthMHz() { return bandwidthMHz; }
    public int getChannels() { return channels; }
    public double getSampleRateGSa() { return sampleRateGSa; }
    public int getMemoryDepthMpts() { return memoryDepthMpts; }
}`
  },
  {
    fileName: 'LabManager.java',
    className: 'LabManager',
    description: 'Central Service Singleton and Observable subject coordinating device registry, reservations, and usage logging.',
    oopConcepts: ['Singleton Pattern', 'Observer Pattern', 'Information Expert Principle'],
    code: `package com.volttrack.lab.service;

import com.volttrack.lab.model.*;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Singleton Service managing lab equipment inventory, active checkouts, and history.
 */
public class LabManager {
    private static volatile LabManager instance;
    private final List<Equipment> equipmentList = new CopyOnWriteArrayList<>();
    private final List<UsageLog> usageHistory = new CopyOnWriteArrayList<>();
    private final List<LabEventListener> listeners = new CopyOnWriteArrayList<>();

    private LabManager() {
        // Private constructor enforcing Singleton pattern
    }

    public static LabManager getInstance() {
        if (instance == null) {
            synchronized (LabManager.class) {
                if (instance == null) {
                    instance = new LabManager();
                }
            }
        }
        return instance;
    }

    public void registerEquipment(Equipment equipment) {
        Objects.requireNonNull(equipment, "Equipment cannot be null");
        boolean exists = equipmentList.stream()
            .anyMatch(e -> e.getAssetTag().equalsIgnoreCase(equipment.getAssetTag()));
        if (exists) {
            throw new IllegalArgumentException("Asset tag already exists: " + equipment.getAssetTag());
        }
        equipmentList.add(equipment);
        notifyListeners();
    }

    public ActiveSession checkOut(String equipmentId, String user, UserRole role, 
                                 String project, String bench, double hours, String notes) {
        Equipment eq = findById(equipmentId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found: " + equipmentId));
        
        ActiveSession session = eq.checkOut(user, role, project, bench, hours, notes);
        notifyListeners();
        return session;
    }

    public UsageLog returnEquipment(String equipmentId, String notes, boolean fault, String faultDetails) {
        Equipment eq = findById(equipmentId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found: " + equipmentId));

        UsageLog log = eq.returnEquipment(notes, fault, faultDetails);
        usageHistory.add(0, log);
        notifyListeners();
        return log;
    }

    public Optional<Equipment> findById(String id) {
        return equipmentList.stream().filter(e -> e.getId().equals(id)).findFirst();
    }

    public List<Equipment> getAllEquipment() {
        return Collections.unmodifiableList(equipmentList);
    }

    public List<UsageLog> getUsageHistory() {
        return Collections.unmodifiableList(usageHistory);
    }

    public void addListener(LabEventListener listener) {
        listeners.add(listener);
    }

    private void notifyListeners() {
        for (LabEventListener listener : listeners) {
            listener.onLabStateChanged();
        }
    }
}`
  },
  {
    fileName: 'EquipmentFactory.java',
    className: 'EquipmentFactory',
    description: 'Factory Pattern implementation creating appropriate polymorphic Equipment instances from raw data.',
    oopConcepts: ['Factory Pattern', 'Decoupling', 'Extensibility'],
    code: `package com.volttrack.lab.factory;

import com.volttrack.lab.model.*;
import java.time.LocalDate;
import java.util.Map;

/**
 * Factory class for instantiating polymorphic Equipment subclasses.
 */
public class EquipmentFactory {

    public static Equipment create(EquipmentCategory category, String assetTag, String name,
                                   String manufacturer, String model, String serialNumber,
                                   String location, double powerWatts, LocalDate calDate,
                                   int calInterval, double hours, Map<String, Object> specs) {
        return switch (category) {
            case OSCILLOSCOPE -> new Oscilloscope(
                assetTag, name, manufacturer, model, serialNumber, location, powerWatts,
                calDate, calInterval, hours,
                (int) specs.getOrDefault("bandwidthMHz", 100),
                (int) specs.getOrDefault("channels", 4),
                ((Number) specs.getOrDefault("sampleRateGSa", 1.0)).doubleValue(),
                (int) specs.getOrDefault("memoryDepthMpts", 12)
            );
            case FUNCTION_GENERATOR -> new FunctionGenerator(
                assetTag, name, manufacturer, model, serialNumber, location, powerWatts,
                calDate, calInterval, hours, specs
            );
            case DIGITAL_MULTIMETER -> new DigitalMultimeter(
                assetTag, name, manufacturer, model, serialNumber, location, powerWatts,
                calDate, calInterval, hours, specs
            );
            case DC_POWER_SUPPLY -> new DCPowerSupply(
                assetTag, name, manufacturer, model, serialNumber, location, powerWatts,
                calDate, calInterval, hours, specs
            );
            default -> new GenericEquipment(
                assetTag, name, manufacturer, model, serialNumber, category,
                location, powerWatts, calDate, calInterval, hours, specs
            );
        };
    }
}`
  },
  {
    fileName: 'LabEquipmentGUI.java',
    className: 'LabEquipmentGUI',
    description: 'Java Swing / JavaFX Desktop GUI frame demonstrating MVC pattern and event-driven interaction with LabManager.',
    oopConcepts: ['Model-View-Controller (MVC)', 'Event-Driven Programming', 'Observer UI Binding'],
    code: `package com.volttrack.lab.gui;

import com.volttrack.lab.model.Equipment;
import com.volttrack.lab.model.UsageLog;
import com.volttrack.lab.service.LabManager;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

/**
 * Java GUI View rendering equipment table, active usage timers, and check-in/out dialogs.
 */
public class LabEquipmentGUI extends JFrame {
    private final LabManager labManager = LabManager.getInstance();
    private final DefaultTableModel equipmentTableModel;
    private final DefaultTableModel historyTableModel;

    public LabEquipmentGUI() {
        super("VoltTrack - Electronics Lab Equipment Tracker");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1100, 700);
        setLocationRelativeTo(null);

        // Tabbed Pane for Multi-View GUI
        JTabbedPane tabbedPane = new JTabbedPane();

        // 1. Equipment Inventory Table
        String[] eqCols = {"Asset Tag", "Name", "Category", "Location", "Status", "Total Usage (hrs)", "Health"};
        equipmentTableModel = new DefaultTableModel(eqCols, 0);
        JTable equipmentTable = new JTable(equipmentTableModel);
        tabbedPane.addTab("Current Devices", new JScrollPane(equipmentTable));

        // 2. Usage History Audit Table
        String[] histCols = {"Log ID", "Asset Tag", "User", "Project", "Start Time", "Duration (min)", "Fault?"};
        historyTableModel = new DefaultTableModel(histCols, 0);
        JTable historyTable = new JTable(historyTableModel);
        tabbedPane.addTab("Usage History", new JScrollPane(historyTable));

        // Action Toolbar
        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton checkOutBtn = new JButton("Check Out Device");
        JButton returnBtn = new JButton("Return Device");
        JButton calibrateBtn = new JButton("Calibrate");
        actionPanel.add(checkOutBtn);
        actionPanel.add(returnBtn);
        actionPanel.add(calibrateBtn);

        setLayout(new BorderLayout());
        add(actionPanel, BorderLayout.NORTH);
        add(tabbedPane, BorderLayout.CENTER);

        // Hook up Observer listener for real-time GUI refresh
        labManager.addListener(this::refreshData);
        refreshData();
    }

    private void refreshData() {
        SwingUtilities.invokeLater(() -> {
            equipmentTableModel.setRowCount(0);
            for (Equipment eq : labManager.getAllEquipment()) {
                equipmentTableModel.addRow(new Object[]{
                    eq.getAssetTag(), eq.getName(), eq.getCategory(),
                    eq.getLocation(), eq.getStatus(), eq.getTotalUsageHours(),
                    eq.getHealthScore() + "%"
                });
            }

            historyTableModel.setRowCount(0);
            for (UsageLog log : labManager.getUsageHistory()) {
                historyTableModel.addRow(new Object[]{
                    log.id(), log.assetTag(), log.userName(),
                    log.projectName(), log.startTime(), log.durationMinutes(),
                    log.faultReported() ? "FAULT" : "OK"
                });
            }
        });
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new LabEquipmentGUI().setVisible(true));
    }
}`
  }
];
