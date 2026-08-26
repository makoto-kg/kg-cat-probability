export interface DepartmentData {
  name: string;
  maleApplicants: number;
  maleAdmitted: number;
  maleRate: number;
  femaleApplicants: number;
  femaleAdmitted: number;
  femaleRate: number;
  overallRate: number;
}

export interface SimpsonSummary {
  departments: DepartmentData[];
  totalMaleApplicants: number;
  totalMaleAdmitted: number;
  overallMaleRate: number;
  totalFemaleApplicants: number;
  totalFemaleAdmitted: number;
  overallFemaleRate: number;
  departmentsWhereFemaleLeads: string[];
}

export const BERKELEY_1973_DATA: DepartmentData[] = [
  {
    name: "A",
    maleApplicants: 825,
    maleAdmitted: 512,
    maleRate: 0.62,
    femaleApplicants: 108,
    femaleAdmitted: 89,
    femaleRate: 0.82,
    overallRate: (512 + 89) / (825 + 108),
  },
  {
    name: "B",
    maleApplicants: 560,
    maleAdmitted: 353,
    maleRate: 0.63,
    femaleApplicants: 25,
    femaleAdmitted: 17,
    femaleRate: 0.68,
    overallRate: (353 + 17) / (560 + 25),
  },
  {
    name: "C",
    maleApplicants: 325,
    maleAdmitted: 120,
    maleRate: 0.37,
    femaleApplicants: 593,
    femaleAdmitted: 202,
    femaleRate: 0.34,
    overallRate: (120 + 202) / (325 + 593),
  },
  {
    name: "D",
    maleApplicants: 417,
    maleAdmitted: 138,
    maleRate: 0.33,
    femaleApplicants: 375,
    femaleAdmitted: 131,
    femaleRate: 0.35,
    overallRate: (138 + 131) / (417 + 375),
  },
  {
    name: "E",
    maleApplicants: 191,
    maleAdmitted: 53,
    maleRate: 0.28,
    femaleApplicants: 393,
    femaleAdmitted: 94,
    femaleRate: 0.24,
    overallRate: (53 + 94) / (191 + 393),
  },
  {
    name: "F",
    maleApplicants: 373,
    maleAdmitted: 22,
    maleRate: 0.06,
    femaleApplicants: 341,
    femaleAdmitted: 24,
    femaleRate: 0.07,
    overallRate: (22 + 24) / (373 + 341),
  },
];

export function computeSimpsonSummary(
  data: DepartmentData[] = BERKELEY_1973_DATA
): SimpsonSummary {
  let totalMaleApplicants = 0;
  let totalMaleAdmitted = 0;
  let totalFemaleApplicants = 0;
  let totalFemaleAdmitted = 0;

  const departmentsWhereFemaleLeads: string[] = [];

  for (const dept of data) {
    totalMaleApplicants += dept.maleApplicants;
    totalMaleAdmitted += dept.maleAdmitted;
    totalFemaleApplicants += dept.femaleApplicants;
    totalFemaleAdmitted += dept.femaleAdmitted;

    if (dept.femaleRate > dept.maleRate) {
      departmentsWhereFemaleLeads.push(dept.name);
    }
  }

  return {
    departments: data,
    totalMaleApplicants,
    totalMaleAdmitted,
    overallMaleRate: totalMaleAdmitted / totalMaleApplicants,
    totalFemaleApplicants,
    totalFemaleAdmitted,
    overallFemaleRate: totalFemaleAdmitted / totalFemaleApplicants,
    departmentsWhereFemaleLeads,
  };
}
