import type {
  Job,
  Technician,
  Customer,
  FieldServiceStats,
  JobPriority,
  JobStatus,
  ServiceType,
  CustomerTier,
  ServiceOutcome,
} from '@/types/fieldService';

// Irish locations for realistic addresses
const DUBLIN_LOCATIONS = [
  { area: 'Dublin City Centre', lat: 53.3498, lng: -6.2603 },
  { area: 'Ballymun', lat: 53.3956, lng: -6.2665 },
  { area: 'Tallaght', lat: 53.2859, lng: -6.3736 },
  { area: 'Swords', lat: 53.4597, lng: -6.2181 },
  { area: 'Blanchardstown', lat: 53.3875, lng: -6.3758 },
  { area: 'Dun Laoghaire', lat: 53.2942, lng: -6.1337 },
  { area: 'Clontarf', lat: 53.3662, lng: -6.2081 },
  { area: 'Rathfarnham', lat: 53.3018, lng: -6.2811 },
  { area: 'Sandyford', lat: 53.2781, lng: -6.2197 },
  { area: 'Drumcondra', lat: 53.3701, lng: -6.2567 },
];

// Realistic Irish business customers
const CUSTOMERS_DATA = [
  // Restaurants
  { name: 'The Brazen Head Restaurant', type: 'Restaurant', tier: 'vip' as CustomerTier, hours: 'Mon-Sun: 12:00-23:00' },
  { name: 'Milano Pizzeria Tallaght', type: 'Restaurant', tier: 'premium' as CustomerTier, hours: 'Mon-Sun: 11:30-22:30' },
  { name: "O'Connell's Gastropub", type: 'Restaurant', tier: 'premium' as CustomerTier, hours: 'Mon-Sun: 12:00-00:00' },
  { name: 'Siam Thai Restaurant', type: 'Restaurant', tier: 'standard' as CustomerTier, hours: 'Tue-Sun: 17:00-22:00' },

  // Offices
  { name: 'Tech Quarter Business Park', type: 'Office', tier: 'vip' as CustomerTier, hours: 'Mon-Fri: 07:00-19:00' },
  { name: 'Trinity Point Office Complex', type: 'Office', tier: 'premium' as CustomerTier, hours: 'Mon-Fri: 08:00-18:00' },
  { name: 'Sandyford Industrial Estate - Unit 12', type: 'Office', tier: 'standard' as CustomerTier, hours: 'Mon-Fri: 09:00-17:30' },

  // Retail
  { name: 'Dunnes Stores Blanchardstown', type: 'Retail', tier: 'vip' as CustomerTier, hours: 'Mon-Sun: 08:00-22:00' },
  { name: 'Supervalu Rathfarnham', type: 'Retail', tier: 'premium' as CustomerTier, hours: 'Mon-Sun: 07:30-22:00' },
  { name: 'Centra Clontarf', type: 'Retail', tier: 'standard' as CustomerTier, hours: 'Mon-Sun: 07:00-23:00' },

  // Warehouses
  { name: 'DHL Logistics Hub', type: 'Warehouse', tier: 'vip' as CustomerTier, hours: '24/7 Operations' },
  { name: 'Musgrave Distribution Centre', type: 'Warehouse', tier: 'premium' as CustomerTier, hours: 'Mon-Sat: 06:00-22:00' },

  // Hotels
  { name: 'Clayton Hotel Ballsbridge', type: 'Hotel', tier: 'vip' as CustomerTier, hours: '24/7 Operations' },
  { name: 'Travelodge Swords', type: 'Hotel', tier: 'premium' as CustomerTier, hours: '24/7 Operations' },

  // Healthcare
  { name: 'Tallaght Medical Centre', type: 'Healthcare', tier: 'vip' as CustomerTier, hours: 'Mon-Fri: 08:00-20:00, Sat: 09:00-13:00' },
  { name: 'Drumcondra Dental Practice', type: 'Healthcare', tier: 'premium' as CustomerTier, hours: 'Mon-Fri: 09:00-18:00' },
];

// Detailed job scenarios by service type
const JOB_SCENARIOS = {
  repair: [
    {
      title: 'Commercial cooler losing temperature',
      description: 'Walk-in cooler alarm triggered at 3:15am. Temperature risen from 2°C to 8°C. Urgent - stock at risk.',
      skills: ['Refrigeration', 'HVAC'],
      complexity: 'standard' as const,
      parts: [
        { name: 'Compressor relay switch', quantity: 1, sku: 'CR-410A-SW' },
        { name: 'Refrigerant R-410A', quantity: 2, sku: 'REF-410A-2KG' },
      ],
      diagnosis: 'Faulty compressor relay causing intermittent shutdowns. Refrigerant levels low due to minor leak at condenser connection.',
      work: 'Replaced compressor relay switch. Located and sealed refrigerant leak. Recharged system to manufacturer specifications. Tested unit through full cooling cycle.',
    },
    {
      title: 'Rooftop HVAC unit making loud grinding noise',
      description: 'Tenants complaining about loud mechanical noise from rooftop unit. Started yesterday afternoon. Unit still cooling but noise concerning.',
      skills: ['HVAC', 'Mechanical'],
      complexity: 'standard' as const,
      parts: [
        { name: 'Fan motor bearing', quantity: 1, sku: 'FMB-2400-BR' },
        { name: 'Drive belt', quantity: 1, sku: 'DB-42-HD' },
      ],
      diagnosis: 'Fan motor bearing worn out causing grinding noise. Drive belt showing signs of wear. Preventative replacement recommended.',
      work: 'Replaced worn fan motor bearing. Installed new drive belt as preventative measure. Lubricated all moving parts. Unit now running quietly.',
    },
    {
      title: 'Emergency lighting not working in stairwell B',
      description: 'Emergency exit lights not illuminating during weekly fire alarm test. Building manager concerned about safety compliance.',
      skills: ['Electrical', 'Fire Safety'],
      complexity: 'simple' as const,
      parts: [
        { name: 'Emergency light battery pack', quantity: 3, sku: 'EL-BAT-12V' },
        { name: 'LED emergency bulb', quantity: 2, sku: 'LED-EM-9W' },
      ],
      diagnosis: 'Three emergency light battery packs exceeded service life (installed 2019). Two LED bulbs failed.',
      work: 'Replaced all emergency light battery packs in stairwell B. Changed two failed LED bulbs. Tested all emergency lighting - now fully functional.',
    },
    {
      title: 'Plumbing leak in staff bathroom ceiling',
      description: 'Water dripping from ceiling tiles in ground floor bathroom. Likely issue with pipes from bathroom above.',
      skills: ['Plumbing'],
      complexity: 'standard' as const,
      parts: [
        { name: 'Copper pipe elbow 22mm', quantity: 2, sku: 'CP-ELB-22' },
        { name: 'Pipe insulation foam', quantity: 3, sku: 'PINS-22-1M' },
        { name: 'Ceiling tiles 600x600mm', quantity: 4, sku: 'CT-600-WH' },
      ],
      diagnosis: 'Corroded copper pipe joint in ceiling void above ground floor bathroom. Water damage to 4 ceiling tiles.',
      work: 'Cut out corroded section. Installed new copper elbows with compression fittings. Added insulation to prevent condensation. Replaced water-damaged ceiling tiles.',
    },
  ],
  maintenance: [
    {
      title: 'Quarterly HVAC system maintenance',
      description: 'Scheduled quarterly service for rooftop HVAC units. 3 units total. Check filters, test thermostats, inspect belts.',
      skills: ['HVAC', 'Electrical'],
      complexity: 'simple' as const,
      parts: [
        { name: 'Air filter 20x25x4', quantity: 6, sku: 'AF-2025-MERV13' },
        { name: 'Thermostat batteries', quantity: 4, sku: 'BAT-AA-4PK' },
      ],
      diagnosis: 'Routine service. All units operating within normal parameters. Filters moderately dirty.',
      work: 'Changed all air filters on 3 rooftop units. Replaced thermostat batteries. Cleaned condenser coils. Checked refrigerant levels - all normal. No issues found.',
    },
    {
      title: 'Monthly fire safety equipment inspection',
      description: 'Monthly inspection of fire extinguishers, smoke detectors, and fire panels across facility.',
      skills: ['Fire Safety'],
      complexity: 'simple' as const,
      parts: [
        { name: 'Fire extinguisher inspection tags', quantity: 12, sku: 'FE-TAG-MNTH' },
        { name: 'Smoke detector batteries', quantity: 8, sku: 'BAT-9V-8PK' },
      ],
      diagnosis: 'All equipment functional. 8 smoke detector batteries showing low voltage warnings.',
      work: 'Inspected all 12 fire extinguishers - pressures good, tagged. Replaced batteries in 8 smoke detectors. Tested fire panel communication - all zones responding.',
    },
    {
      title: 'Refrigeration unit preventative service',
      description: 'Six-month service for walk-in freezer and cooler units. Temperature logs show units working harder than usual.',
      skills: ['Refrigeration', 'Electrical'],
      complexity: 'standard' as const,
      parts: [
        { name: 'Condenser coil cleaner', quantity: 2, sku: 'CCC-IND-1L' },
        { name: 'Door gasket seal', quantity: 1, sku: 'DG-COOLER-36' },
      ],
      diagnosis: 'Condenser coils heavily clogged with dust. Cooler door gasket showing wear on bottom edge.',
      work: 'Deep cleaned condenser coils with industrial cleaner. Replaced worn door gasket on walk-in cooler. Checked all temperature sensors - calibrated and accurate.',
    },
  ],
  installation: [
    {
      title: 'Install new security camera system - 8 cameras',
      description: 'Installation of 8 IP cameras for parking area and main entrance. Network drops already run by previous contractor.',
      skills: ['Security Systems', 'Networking', 'Electrical'],
      complexity: 'complex' as const,
      parts: [
        { name: 'IP security camera 4MP', quantity: 8, sku: 'CAM-IP-4MP-OUT' },
        { name: 'Network switch 16-port POE', quantity: 1, sku: 'NSW-16P-POE' },
        { name: 'CAT6 RJ45 connectors', quantity: 20, sku: 'CAT6-RJ45-20' },
      ],
      diagnosis: 'N/A - New installation',
      work: 'Mounted 8 IP cameras at specified locations. Terminated all network cables. Configured POE switch and camera network. Set up recording schedule on NVR. Tested all camera views.',
    },
    {
      title: 'New commercial oven installation',
      description: 'Install replacement commercial oven in kitchen. Old unit removed by customer. Gas line and electrical already in place.',
      skills: ['Electrical', 'Gas Safe'],
      complexity: 'complex' as const,
      parts: [
        { name: 'Commercial oven connector kit', quantity: 1, sku: 'COV-GAS-3/4' },
        { name: 'Gas hose 1m braided', quantity: 1, sku: 'GH-1M-SS' },
        { name: 'Electrical outlet 32A', quantity: 1, sku: 'EO-32A-240V' },
      ],
      diagnosis: 'N/A - New installation',
      work: 'Positioned new commercial oven. Connected gas supply with braided hose and safety shut-off. Wired 32A electrical connection. Performed leak test on gas connections. Commissioned oven and tested all functions.',
    },
  ],
  inspection: [
    {
      title: 'Annual fire safety certification inspection',
      description: 'Required annual inspection for fire safety certification. Inspector coming next week - need compliance check.',
      skills: ['Fire Safety', 'Electrical'],
      complexity: 'standard' as const,
      parts: [],
      diagnosis: 'Pre-inspection check completed. All systems functional and compliant.',
      work: 'Inspected all fire extinguishers, emergency lighting, smoke detectors, fire panels, and exit signage. Tested emergency power systems. Generated compliance report. No deficiencies found.',
    },
    {
      title: 'Electrical safety inspection for tenants',
      description: 'New tenant moving in next week. Landlord requires electrical safety inspection certificate.',
      skills: ['Electrical'],
      complexity: 'simple' as const,
      parts: [],
      diagnosis: 'All electrical installations meet current regulations. Minor issue with one outlet.',
      work: 'Tested all electrical circuits, outlets, and safety switches. Checked earthing and bonding. One outlet showing low earth reading - tightened connections. Issued electrical safety certificate.',
    },
  ],
  emergency: [
    {
      title: 'EMERGENCY: Complete power loss in building',
      description: 'Total power outage affecting entire building. Emergency generator not kicking in. Multiple businesses affected.',
      skills: ['Electrical'],
      complexity: 'complex' as const,
      parts: [
        { name: 'Generator starter battery', quantity: 1, sku: 'GEN-BAT-12V-100AH' },
        { name: 'Main circuit breaker 200A', quantity: 1, sku: 'MCB-200A-3P' },
      ],
      diagnosis: 'Main circuit breaker failed due to overload. Emergency generator battery dead - unable to start automatically.',
      work: 'Replaced failed main circuit breaker. Installed new generator battery. Started emergency generator manually. Restored power to building. Tested automatic transfer switch.',
    },
    {
      title: 'EMERGENCY: Gas leak detected in kitchen',
      description: 'Staff reporting strong gas smell in kitchen area. Building evacuated as precaution. Gas supply isolated at meter.',
      skills: ['Gas Safe', 'Plumbing'],
      complexity: 'complex' as const,
      parts: [
        { name: 'Gas valve 3/4 inch', quantity: 1, sku: 'GV-075-BR' },
        { name: 'Pipe thread sealant', quantity: 1, sku: 'PTS-GAS-50ML' },
      ],
      diagnosis: 'Gas isolation valve behind commercial range showing external leak at stem. Valve body corroded.',
      work: 'Isolated gas at mains. Replaced faulty isolation valve. Applied gas-rated thread sealant. Performed comprehensive leak test on all connections. Purged and recommissioned gas lines.',
    },
  ],
};

const TECH_PROFILES = [
  {
    name: 'Sean Murphy',
    level: 'master' as const,
    certs: ['Gas Safe Registered', 'OFTEC Oil Technician', 'F-Gas Certified'],
    specialization: 'HVAC',
    skills: ['HVAC', 'Refrigeration', 'Gas Safe', 'Electrical'],
    rating: 4.9,
    fixRate: 94,
    avgTime: 65,
  },
  {
    name: "Aoife O'Brien",
    level: 'senior' as const,
    certs: ['Safe Electric Registered', 'Fire Safety Cert', 'PAT Testing'],
    specialization: 'Electrical',
    skills: ['Electrical', 'Fire Safety', 'Security Systems'],
    rating: 4.8,
    fixRate: 91,
    avgTime: 58,
  },
  {
    name: 'Liam Kelly',
    level: 'master' as const,
    certs: ['Gas Safe Registered', 'Plumbing Registered', 'Water Regs'],
    specialization: 'Plumbing',
    skills: ['Plumbing', 'Gas Safe', 'Heating'],
    rating: 4.9,
    fixRate: 95,
    avgTime: 72,
  },
  {
    name: 'Niamh Walsh',
    level: 'senior' as const,
    certs: ['F-Gas Certified', 'HVAC Technician', 'Refrigeration Safe'],
    specialization: 'Refrigeration',
    skills: ['Refrigeration', 'HVAC', 'Electrical'],
    rating: 4.7,
    fixRate: 89,
    avgTime: 68,
  },
  {
    name: 'Connor Ryan',
    level: 'junior' as const,
    certs: ['Safe Electric Apprentice', 'First Aid'],
    specialization: 'Electrical',
    skills: ['Electrical', 'Networking'],
    rating: 4.5,
    fixRate: 82,
    avgTime: 95,
  },
  {
    name: 'Siobhan Brennan',
    level: 'senior' as const,
    certs: ['Fire Safety Officer', 'Emergency Lighting', 'Security Systems'],
    specialization: 'Fire Safety',
    skills: ['Fire Safety', 'Electrical', 'Security Systems'],
    rating: 4.8,
    fixRate: 93,
    avgTime: 52,
  },
  {
    name: 'Cian Doyle',
    level: 'master' as const,
    certs: ['Gas Safe Registered', 'HVAC Master', 'Building Management Systems'],
    specialization: 'HVAC',
    skills: ['HVAC', 'Electrical', 'Mechanical', 'Gas Safe'],
    rating: 4.9,
    fixRate: 96,
    avgTime: 61,
  },
  {
    name: 'Caoimhe Lynch',
    level: 'senior' as const,
    certs: ['Network Technician', 'CCTV Installer', 'Access Control'],
    specialization: 'Security Systems',
    skills: ['Security Systems', 'Networking', 'Electrical'],
    rating: 4.6,
    fixRate: 87,
    avgTime: 78,
  },
  {
    name: 'Oisin McCarthy',
    level: 'junior' as const,
    certs: ['Plumbing Apprentice', 'Water Safety'],
    specialization: 'Plumbing',
    skills: ['Plumbing', 'Heating'],
    rating: 4.4,
    fixRate: 79,
    avgTime: 102,
  },
  {
    name: 'Roisin Fitzgerald',
    level: 'senior' as const,
    certs: ['F-Gas Certified', 'Refrigeration Tech', 'Food Safety'],
    specialization: 'Refrigeration',
    skills: ['Refrigeration', 'HVAC', 'Electrical'],
    rating: 4.7,
    fixRate: 90,
    avgTime: 66,
  },
  {
    name: 'Patrick Collins',
    level: 'master' as const,
    certs: ['Safe Electric Master', 'High Voltage Cert', 'Generator Specialist'],
    specialization: 'Electrical',
    skills: ['Electrical', 'Emergency Systems', 'Mechanical'],
    rating: 5.0,
    fixRate: 97,
    avgTime: 58,
  },
  {
    name: 'Maeve Gallagher',
    level: 'senior' as const,
    certs: ['HVAC Technician', 'BMS Systems', 'Energy Management'],
    specialization: 'HVAC',
    skills: ['HVAC', 'Electrical', 'Mechanical'],
    rating: 4.8,
    fixRate: 92,
    avgTime: 64,
  },
  {
    name: "Darragh O'Connor",
    level: 'junior' as const,
    certs: ['Fire Safety Trainee', 'First Aid'],
    specialization: 'Fire Safety',
    skills: ['Fire Safety', 'Electrical'],
    rating: 4.3,
    fixRate: 77,
    avgTime: 88,
  },
  {
    name: 'Ciara Donoghue',
    level: 'senior' as const,
    certs: ['Gas Safe Registered', 'Commercial Kitchen Specialist'],
    specialization: 'Gas Safe',
    skills: ['Gas Safe', 'Plumbing', 'Electrical'],
    rating: 4.7,
    fixRate: 89,
    avgTime: 71,
  },
  {
    name: 'Eoin Kavanagh',
    level: 'master' as const,
    certs: ['Multi-trade Master', 'Project Manager', 'Health & Safety Officer'],
    specialization: 'Multi-trade',
    skills: ['Electrical', 'Plumbing', 'HVAC', 'Carpentry', 'Mechanical'],
    rating: 4.9,
    fixRate: 95,
    avgTime: 69,
  },
];

// Status messages for technicians
const TECH_STATUS_MESSAGES = [
  'Finishing up paperwork',
  'Waiting for customer signature',
  'Testing equipment',
  'En route - 10 mins away',
  'Stuck in traffic on M50',
  'Picking up parts from depot',
  'On lunch break',
  'Customer not ready - waiting',
  'Running diagnostics',
];

class FieldServiceDataGenerator {
  private customers: Customer[] = [];
  private technicians: Technician[] = [];
  private jobs: Job[] = [];
  private currentTime: Date = new Date();
  private rngSeed?: number;
  private randomFn: () => number = Math.random;
  private balanced: boolean = false;

  private rnd(): number {
    return this.randomFn();
  }

  private createSeed(seed: string | number): number {
    if (typeof seed === 'number') return seed >>> 0;
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }

  private mulberry32(a: number): () => number {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  public configure(opts: { seed?: string | number; balanced?: boolean }): void {
    if (opts.seed !== undefined) {
      const seed = this.createSeed(opts.seed);
      this.rngSeed = seed;
      this.randomFn = this.mulberry32(seed);
    } else {
      this.rngSeed = undefined;
      this.randomFn = Math.random;
    }
    if (typeof opts.balanced === 'boolean') {
      this.balanced = opts.balanced;
    }
    this.reset();
  }

  public reset(): void {
    this.customers = [];
    this.technicians = [];
    this.jobs = [];
    this.currentTime = new Date();
    this.initializeData();
  }

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    this.generateCustomers();
    this.generateTechnicians();
    this.generateJobs();
  }

  private generateCustomers() {
    this.customers = CUSTOMERS_DATA.map((customer, idx) => {
      const location = DUBLIN_LOCATIONS[idx % DUBLIN_LOCATIONS.length];
      const accountAge = Math.floor(this.rnd() * 60) + 6; // 6-66 months
      const isRepeat = accountAge > 12 || this.rnd() > 0.3;

      // Generate realistic Irish street addresses
      const streetNumber = Math.floor(this.rnd() * 200) + 1;
      const streets = ['Main Street', 'High Street', 'Church Road', 'Park Avenue', 'Station Road', 'Castle Street'];
      const street = streets[Math.floor(this.rnd() * streets.length)];
      const fullAddress = `${streetNumber} ${street}, ${location.area}, Dublin`;

      // Access instructions based on business type
      const accessInstructions: Record<string, string[]> = {
        Restaurant: ['Use staff entrance on side street', 'Ring doorbell at back entrance', 'Kitchen access through loading bay'],
        Office: ['Report to reception on ground floor', 'Sign in at security desk', 'Use service elevator to access rooftop'],
        Retail: ['See store manager on duty', 'Access through rear loading dock', 'Check in at customer service desk'],
        Warehouse: ['Report to gatehouse - PPE required', 'Use south entrance for contractors', 'Forklift traffic - high-vis required'],
        Hotel: ['Check in at maintenance office', 'Use service entrance - key code required', 'Contact facilities manager on arrival'],
        Healthcare: ['Reception will provide site access', 'Must sign HIPAA compliance', 'Work during off-hours only'],
      };

      const instructions = accessInstructions[customer.type] || ['Contact site manager on arrival'];
      const selectedInstruction = instructions[Math.floor(this.rnd() * instructions.length)];

      return {
        id: `cust-${String(idx + 1).padStart(3, '0')}`,
        name: customer.name,
        businessType: customer.type,
        tier: customer.tier,
        address: fullAddress,
        latitude: location.lat + (this.rnd() - 0.5) * 0.02,
        longitude: location.lng + (this.rnd() - 0.5) * 0.02,
        phone: `+353 1 ${Math.floor(this.rnd() * 900 + 100)} ${Math.floor(this.rnd() * 9000 + 1000)}`,
        accountAge,
        isRepeatCustomer: isRepeat,
        accessInstructions: selectedInstruction,
        preferredContactMethod: this.rnd() > 0.5 ? 'phone' : this.rnd() > 0.5 ? 'sms' : 'email',
        businessHours: customer.hours,
      };
    });
  }

  private generateTechnicians() {
    const now = new Date();
    const shiftStart = new Date(now.setHours(8, 0, 0, 0));
    const shiftEnd = new Date(now.setHours(18, 0, 0, 0));

    this.technicians = TECH_PROFILES.map((profile, idx) => {
      const location = DUBLIN_LOCATIONS[idx % DUBLIN_LOCATIONS.length];
      const isOnBreak = now.getHours() === 13 && this.rnd() > 0.7;
      const isOffline = this.rnd() > 0.9;

      let status: 'available' | 'busy' | 'offline' | 'break' = 'available';
      let statusDetail: string | undefined;

      if (isOffline) {
        status = 'offline';
        statusDetail = 'Off duty';
      } else if (isOnBreak) {
        status = 'break';
        statusDetail = 'Lunch break';
      } else if (this.rnd() > 0.5) {
        status = 'busy';
        statusDetail = TECH_STATUS_MESSAGES[Math.floor(this.rnd() * TECH_STATUS_MESSAGES.length)];
      }

      const currentLocationOptions = [
        'At depot',
        'On-site with customer',
        'In transit',
        `Near ${location.area}`,
        'At parts supplier',
      ];

      return {
        id: `tech-${String(idx + 1).padStart(3, '0')}`,
        name: profile.name,
        experienceLevel: profile.level,
        skills: profile.skills,
        certifications: profile.certs,
        specialization: profile.specialization,
        vehicleId: `van-${String(idx + 1).padStart(3, '0')}`,

        // Performance metrics
        avgCompletionTime: profile.avgTime,
        customerRating: profile.rating,
        firstTimeFixRate: profile.fixRate,

        // Location
        latitude: location.lat + (this.rnd() - 0.5) * 0.05,
        longitude: location.lng + (this.rnd() - 0.5) * 0.05,
        currentLocation: currentLocationOptions[Math.floor(this.rnd() * currentLocationOptions.length)],

        // Daily stats
        assignedJobs: [],
        completedJobs: [],
        onSiteMinutes: 0,
        drivingMinutes: 0,
        idleMinutes: 0,

        // Status
        status,
        statusDetail,
        currentJobId: undefined,

        // Schedule
        shiftStart: new Date(shiftStart),
        shiftEnd: new Date(shiftEnd),
        breakTime: isOnBreak ? {
          start: new Date(now.setHours(13, 0, 0, 0)),
          end: new Date(now.setHours(13, 30, 0, 0)),
        } : undefined,
      };
    });
  }

  private generateJobs() {
    const totalJobs = 58;
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    for (let i = 0; i < totalJobs; i++) {
      const customer = this.customers[Math.floor(this.rnd() * this.customers.length)];
      const serviceType = this.randomServiceType();
      const priority = this.randomPriority(customer.tier, serviceType);

      // Get scenario for this job
      const scenarios = JOB_SCENARIOS[serviceType];
      const scenario = scenarios[Math.floor(this.rnd() * scenarios.length)];

      // Generate window times throughout the day
      const windowStartHour = 8 + Math.floor((i / totalJobs) * 10);
      const windowStart = new Date(todayStart);
      windowStart.setHours(windowStartHour, Math.floor(this.rnd() * 60), 0, 0);

      const windowEnd = new Date(windowStart);
      windowEnd.setHours(windowStart.getHours() + 2);

      const plannedDuration = this.getPlannedDuration(scenario.complexity);
      const status = this.getJobStatus(i, totalJobs);
      const tech = this.assignTechnician(status, scenario.skills);

      // Determine if emergency or follow-up
      const isEmergency = serviceType === 'emergency' || (priority === 'critical' && this.rnd() > 0.5);
      const isFollowUp = !isEmergency && this.rnd() > 0.85;
      const previousJobId = isFollowUp ? `job-${String(Math.floor(this.rnd() * i)).padStart(4, '0')}` : undefined;

      // Equipment age affects complexity for repairs
      const equipmentAge = ['repair', 'maintenance'].includes(serviceType)
        ? Math.floor(this.rnd() * 15) + 1
        : undefined;

      const job: Job = {
        id: `job-${String(i + 1).padStart(4, '0')}`,
        customer,
        serviceType,
        priority,
        status,

        // Job details
        title: scenario.title,
        description: scenario.description,
        diagnosisNotes: status === 'completed' || status === 'in-progress' ? scenario.diagnosis : undefined,

        // Timing
        windowStart,
        windowEnd,
        plannedDuration,
        complexity: scenario.complexity,

        // Assignment
        assignedTechId: tech?.id,
        assignedVehicleId: tech?.vehicleId,

        // Requirements
        requiredSkills: scenario.skills,
        requiredParts: scenario.parts.map(p => `${p.name} (${p.sku})`),
        equipmentAge,

        // Special handling
        isEmergency,
        isFollowUp,
        previousJobId,
        specialInstructions: customer.accessInstructions,
        customerNotified: status !== 'planned',

        // Metadata
        createdAt: new Date(todayStart),
      };

      // Add timestamps based on status
      if (status !== 'planned') {
        job.dispatchedAt = new Date(windowStart.getTime() - 30 * 60 * 1000);
      }

      if (['en-route', 'arrived', 'in-progress', 'completed'].includes(status)) {
        const arrivalTime = this.calculateArrivalTime(windowStart, windowEnd, i, totalJobs);
        job.arrivedAt = arrivalTime;
        job.estimatedArrival = arrivalTime;
      }

      if (status === 'completed') {
        const actualDuration = plannedDuration + (this.rnd() - 0.5) * 30;
        const completionTime = new Date(job.arrivedAt!.getTime() + actualDuration * 60 * 1000);
        job.completedAt = completionTime;
        job.outcome = this.generateOutcome(scenario, actualDuration, tech);

        if (tech) {
          tech.completedJobs.push(job.id);
          tech.onSiteMinutes += actualDuration;
        }
      }

      if (status === 'in-progress' && tech) {
        tech.currentJobId = job.id;
        tech.status = 'busy';
        tech.statusDetail = 'Working on-site';
        tech.currentLocation = 'On-site with customer';
      }

      if (tech && status !== 'planned') {
        tech.assignedJobs.push(job.id);
      }

      this.jobs.push(job);
    }

    // Calculate driving and idle time for techs (smoothing minutes and baselines)
    this.technicians.forEach(tech => {
      // Add partial on-site minutes for in-progress jobs
      if (tech.currentJobId) {
        const job = this.jobs.find(j => j.id === tech.currentJobId);
        if (job) {
          const fraction = 0.3 + this.rnd() * 0.5; // 30% - 80%
          const partial = Math.floor(job.plannedDuration * fraction);
          tech.onSiteMinutes += partial;
        }
      }

      // Driving minutes for all techs
      const baseTime = 15; // Base time per job
      const trafficVariance = Math.floor(this.rnd() * 15); // 0-15 min variance
      const rushHourPenalty = (now.getHours() >= 8 && now.getHours() <= 9) ||
                               (now.getHours() >= 17 && now.getHours() <= 18) ? 20 : 0;

      if (tech.assignedJobs.length > 0) {
        tech.drivingMinutes = (tech.assignedJobs.length * baseTime) + trafficVariance + rushHourPenalty;
      } else {
        // Baseline light movement even if unassigned
        tech.drivingMinutes = 10 + Math.floor(this.rnd() * 16); // 10-25 min
      }

      const totalMinutes = Math.max(0, (this.currentTime.getHours() - 8) * 60);
      const breakMinutes = tech.breakTime ? 30 : 0;
      tech.idleMinutes = Math.max(0, totalMinutes - tech.onSiteMinutes - tech.drivingMinutes - breakMinutes);
    });
  }

  private randomServiceType(): ServiceType {
    const types: ServiceType[] = ['installation', 'repair', 'maintenance', 'inspection', 'emergency'];
    const weights = [15, 35, 30, 15, 5];
    const random = this.rnd() * 100;
    let cumulative = 0;

    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) return types[i];
    }

    return 'maintenance';
  }

  private randomPriority(tier: CustomerTier, serviceType: ServiceType): JobPriority {
    if (serviceType === 'emergency') return 'critical';

    if (tier === 'vip') return this.rnd() > 0.6 ? 'critical' : 'high';
    if (tier === 'premium') return this.rnd() > 0.5 ? 'high' : 'medium';
    return this.rnd() > 0.7 ? 'medium' : 'low';
  }

  private getPlannedDuration(complexity: 'simple' | 'standard' | 'complex'): number {
    const baseDurations = {
      simple: 45,
      standard: 90,
      complex: 150,
    };
    return baseDurations[complexity] + Math.floor(this.rnd() * 30 - 15);
  }

  private generateWeeklyOnTimeData() {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    // Target wide variance across weeks (seeded, deterministic)
    const centers = [53, 69, 75, 43];
    // Keep average line roughly stable around 88-92%
    const avgBaseline = 88 + this.rnd() * 4;

    return weeks.map((week, weekIndex) => {
      // Weekly aggregate around target centers with small variance
      const weeklyPercentRaw = centers[weekIndex] + (this.rnd() * 6 - 3); // ±3%
      const weeklyPercent = Math.max(0, Math.min(100, weeklyPercentRaw));

      // Constant-ish 7-day average
      const sevenDayAvg = avgBaseline;

      // More dots (18-31), smaller, with horizontal jitter so they are not on a line
      const vehicleCount = 40 + Math.floor(this.rnd() * 30); // 40-69 dots per week
      const vehicles = Array.from({ length: vehicleCount }, (_, i) => {
        const tech = this.technicians[i % this.technicians.length];
        const variance = (this.rnd() * 20 - 10); // ±10%
        const techOnTimeRaw = weeklyPercent + variance;
        const techOnTime = Math.max(0, Math.min(100, techOnTimeRaw));
        const jitter = (this.rnd() - 0.5) * 0.96; // -0.48 .. +0.48 (wider spread)
        const jitteredIndex = Math.max(0, Math.min(weeks.length - 1, weekIndex + jitter));

        return {
          week,
          weekIndex: jitteredIndex,
          vehicleId: tech.vehicleId,
          vehicleName: `${tech.name.split(' ')[0]}'s Van`,
          onTimePercent: Math.round(techOnTime * 10) / 10,
        };
      });

      return {
        week,
        weekIndex,
        weeklyPercent: Math.round(weeklyPercent * 10) / 10,
        sevenDayAvg: Math.round(sevenDayAvg * 10) / 10,
        vehicles,
      };
    });
  }

  private getJobStatus(index: number, total: number): JobStatus {
    const progress = index / total;

    if (progress < 0.72) return 'completed';
    if (progress < 0.82) return 'in-progress';
    if (progress < 0.88) return 'arrived';
    if (progress < 0.93) return 'en-route';
    if (progress < 0.97) return 'dispatched';
    return 'planned';
  }

  private assignTechnician(status: JobStatus, requiredSkills: string[]): Technician | undefined {
    if (status === 'planned') return undefined;

    // Try to find tech with matching skills
    const available = this.technicians.filter(t => t.status !== 'offline');
    const withSkills = available.filter(t =>
      requiredSkills.some(skill => t.skills.includes(skill))
    );

    const candidates = withSkills.length > 0 ? withSkills : available;
    if (this.balanced) {
      const byLoad = [...candidates].sort((a, b) => {
        const aLoad = a.assignedJobs.length * 1000 + (a.onSiteMinutes + a.drivingMinutes);
        const bLoad = b.assignedJobs.length * 1000 + (b.onSiteMinutes + b.drivingMinutes);
        if (aLoad !== bLoad) return aLoad - bLoad;
        return a.id.localeCompare(b.id);
      });
      return byLoad[0];
    }
    return candidates[Math.floor(this.rnd() * candidates.length)];
  }

  private calculateArrivalTime(windowStart: Date, windowEnd: Date, index: number, total: number): Date {
    // 65% arrive on time, 35% are late
    const isLate = this.rnd() > 0.65;

    if (isLate) {
      // Late jobs arrive 10-60 minutes AFTER the deadline
      const lateMinutes = Math.floor(this.rnd() * 50) + 10;
      return new Date(windowEnd.getTime() + lateMinutes * 60 * 1000);
    } else {
      // On-time jobs arrive anywhere between windowStart and windowEnd
      const windowDurationMinutes = (windowEnd.getTime() - windowStart.getTime()) / (60 * 1000);
      const minutesFromStart = Math.floor(this.rnd() * windowDurationMinutes);
      return new Date(windowStart.getTime() + minutesFromStart * 60 * 1000);
    }
  }

  private generateOutcome(
    scenario: (typeof JOB_SCENARIOS)[keyof typeof JOB_SCENARIOS][number],
    actualDuration: number,
    tech: Technician | undefined
  ): ServiceOutcome {
    const isFirstTimeFix = this.rnd() > 0.12; // 88% first-time fix rate

    const failureReasons = [
      'Requires specialized parts not in stock',
      'Customer not available for final approval',
      'Additional issues discovered during service',
      'Weather conditions prevented completion',
      'Need additional contractor for full repair',
    ];

    const recommendations = [
      'Recommend annual service contract for preventative maintenance',
      'Equipment nearing end of service life - consider replacement in next 12-18 months',
      'Install remote monitoring for early fault detection',
      'Consider upgrading to more energy-efficient model',
      'Schedule follow-up inspection in 3 months',
    ];

    const customerFeedbacks = [
      'Very professional and thorough. Explained everything clearly.',
      'Quick response time. Tech was knowledgeable and efficient.',
      'Excellent service. Problem resolved completely.',
      'Took longer than expected but job done properly.',
      'Tech was polite and cleaned up work area well.',
    ];

    return {
      status: isFirstTimeFix ? 'completed' : 'partial',
      revisitRequired: !isFirstTimeFix,
      revisitReason: !isFirstTimeFix ? failureReasons[Math.floor(this.rnd() * failureReasons.length)] : undefined,
      workCompleted: scenario.work,
      partsUsed: scenario.parts,
      failureReason: undefined,
      technicianNotes: `Arrival on-site: ${Math.floor(actualDuration * 0.1)} min. Diagnosis: ${Math.floor(actualDuration * 0.3)} min. Repair work: ${Math.floor(actualDuration * 0.5)} min. Testing & cleanup: ${Math.floor(actualDuration * 0.1)} min.`,
      completedAt: new Date(),
      futureWorkRecommended: this.rnd() > 0.6 ? recommendations[Math.floor(this.rnd() * recommendations.length)] : undefined,
      warrantyInfo: scenario.parts.length > 0 ? '12 months parts warranty, 90 days labor warranty' : undefined,
      customerSatisfaction: Math.floor(this.rnd() * 2) + 4, // 4-5 stars
      customerFeedback: this.rnd() > 0.3 ? customerFeedbacks[Math.floor(this.rnd() * customerFeedbacks.length)] : undefined,
    };
  }

  // Public getters
  getJobs(): Job[] {
    return this.jobs;
  }

  getTechnicians(): Technician[] {
    return this.technicians;
  }

  getCustomers(): Customer[] {
    return this.customers;
  }

  getStats(): FieldServiceStats {
    const completedJobs = this.jobs.filter(j => j.status === 'completed');
    const jobsWithArrival = this.jobs.filter(j => j.arrivedAt && j.windowEnd);

    // On-time arrival %
    const onTimeArrivals = jobsWithArrival.filter(
      j => j.arrivedAt! <= j.windowEnd
    ).length;
    const onTimeArrivalPercent = jobsWithArrival.length > 0
      ? (onTimeArrivals / jobsWithArrival.length) * 100
      : 0;

    // First-time fix %
    const firstTimeFixes = completedJobs.filter(
      j => j.outcome && !j.outcome.revisitRequired
    ).length;
    const firstTimeFixPercent = completedJobs.length > 0
      ? (firstTimeFixes / completedJobs.length) * 100
      : 0;

    // At-risk jobs
    const now = new Date();
    const sixtyMinFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const atRiskJobs = this.jobs.filter(j => {
      if (!j.estimatedArrival || j.status === 'completed') return false;
      return j.estimatedArrival > j.windowEnd && j.estimatedArrival < sixtyMinFromNow;
    });

    // Wrench vs Drive time
    const totalWrench = this.technicians.reduce((sum, t) => sum + t.onSiteMinutes, 0);
    const totalDrive = this.technicians.reduce((sum, t) => sum + t.drivingMinutes, 0);

    // On-time by hour
    const onTimeByHour: { hour: number; percent: number }[] = [];
    for (let hour = 8; hour < 18; hour++) {
      const hourJobs = jobsWithArrival.filter(j => j.windowStart.getHours() === hour);
      const hourOnTime = hourJobs.filter(j => j.arrivedAt! <= j.windowEnd).length;
      const percent = hourJobs.length > 0 ? (hourOnTime / hourJobs.length) * 100 : 90;
      onTimeByHour.push({ hour, percent });
    }

    // On-time by week (simulate 4 weeks of data)
    const onTimeByWeek = this.generateWeeklyOnTimeData();

    return {
      onTimeArrivalPercent: Math.round(onTimeArrivalPercent * 10) / 10,
      onTimeArrivalTrend: 2.3,

      jobsDone: completedJobs.length,
      jobsPlanned: this.jobs.length,
      jobsForecastEOD: Math.floor(completedJobs.length * 1.15),

      atRiskCount: atRiskJobs.length,

      firstTimeFixPercent: Math.round(firstTimeFixPercent * 10) / 10,

      wrenchMinutes: totalWrench,
      driveMinutes: totalDrive,
      wrenchToDriveRatio: totalDrive > 0 ? totalWrench / totalDrive : 0,

      avgResponseTimeMinutes: 22,

      repeatRate: 100 - firstTimeFixPercent,
      avgJobDuration: completedJobs.length > 0
        ? completedJobs.reduce((sum, j) => {
            const duration = (new Date(j.completedAt!).getTime() - new Date(j.arrivedAt!).getTime()) / (60 * 1000);
            return sum + duration;
          }, 0) / completedJobs.length
        : 75,
      slaBreachCount: jobsWithArrival.length - onTimeArrivals,

      onTimeByHour,
      onTimeByWeek,

      funnel: {
        planned: this.jobs.length,
        dispatched: this.jobs.filter(j => j.status !== 'planned').length,
        arrived: this.jobs.filter(j => ['arrived', 'in-progress', 'completed'].includes(j.status)).length,
        completed: completedJobs.length,
      },
    };
  }
}

// Singleton instance
export const fieldServiceDataGenerator = new FieldServiceDataGenerator();
