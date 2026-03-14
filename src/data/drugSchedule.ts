export type DrugSchedule = 'OTC' | 'H' | 'H1' | 'X';

export const getSchedule = (name: string): DrugSchedule => {
  const n = name.toLowerCase();
  const X = ['morphine', 'fentanyl', 'oxycodone'];
  const H1 = ['alprazolam', 'clonazepam', 'diazepam', 'lorazepam', 'zolpidem', 'codeine', 'phenytoin', 'carbamazepine', 'quetiapine', 'olanzapine', 'risperidone', 'tramadol', 'pregabalin'];
  const H = ['amoxicillin', 'azithromycin', 'ciprofloxacin', 'metformin', 'atorvastatin', 'amlodipine', 'metoprolol', 'losartan', 'levothyroxine', 'pantoprazole', 'omeprazole', 'escitalopram', 'sertraline', 'fluoxetine', 'gabapentin', 'insulin', 'warfarin', 'telmisartan'];
  if (X.some((d) => n.includes(d))) return 'X';
  if (H1.some((d) => n.includes(d))) return 'H1';
  if (H.some((d) => n.includes(d))) return 'H';
  return 'OTC';
};