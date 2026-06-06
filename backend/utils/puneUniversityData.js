/**
 * Pune University Standard 11 POs + PSOs
 * Performance Indicators pre-loaded
 */

const PUNE_UNIVERSITY_POS = [
  { poNo: 'PO1', title: 'Engineering Knowledge', description: 'Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.' },
  { poNo: 'PO2', title: 'Problem Analysis', description: 'Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.' },
  { poNo: 'PO3', title: 'Design/Development of Solutions', description: 'Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.' },
  { poNo: 'PO4', title: 'Conduct Investigations of Complex Problems', description: 'Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.' },
  { poNo: 'PO5', title: 'Modern Tool Usage', description: 'Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.' },
  { poNo: 'PO6', title: 'The Engineer and Society', description: 'Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice.' },
  { poNo: 'PO7', title: 'Environment and Sustainability', description: 'Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.' },
  { poNo: 'PO8', title: 'Ethics', description: 'Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.' },
  { poNo: 'PO9', title: 'Individual and Team Work', description: 'Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.' },
  { poNo: 'PO10', title: 'Communication', description: 'Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation.' },
  { poNo: 'PO11', title: 'Project Management and Finance', description: 'Demonstrate knowledge and understanding of the engineering and management principles and apply these to one\'s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.' }
];

const DEFAULT_PSOS = [
  { poNo: 'PSO1', title: 'PSO 1', description: 'Program Specific Outcome 1 — to be defined by department' },
  { poNo: 'PSO2', title: 'PSO 2', description: 'Program Specific Outcome 2 — to be defined by department' },
  { poNo: 'PSO3', title: 'PSO 3', description: 'Program Specific Outcome 3 — to be defined by department' }
];

// Default PI structure for PO1 (Computer Engineering)
const DEFAULT_PI_TEMPLATE = [
  // PO1
  { poNo: 'PO1', subCompetencyNo: '1.1', subCompetencyDesc: 'Demonstrate competence in mathematical modelling', indicator: 'Apply the knowledge of Computer Science and Engineering' },
  { poNo: 'PO1', subCompetencyNo: '1.1', subCompetencyDesc: 'Demonstrate competence in mathematical modelling', indicator: 'Apply the concepts of probability, statistics and queuing theory' },
  { poNo: 'PO1', subCompetencyNo: '1.2', subCompetencyDesc: 'Demonstrate competence in basic sciences', indicator: 'Apply laws of natural science to an engineering problem' },
  { poNo: 'PO1', subCompetencyNo: '1.3', subCompetencyDesc: 'Demonstrate competence in engineering fundamentals', indicator: 'Apply engineering fundamentals' },
  { poNo: 'PO1', subCompetencyNo: '1.4', subCompetencyDesc: 'Demonstrate competence in specialized engineering knowledge', indicator: 'Apply theory and principles of computer science and engineering to solve an engineering problem' },
  // PO2
  { poNo: 'PO2', subCompetencyNo: '2.1', subCompetencyDesc: 'Demonstrate an ability to identify and formulate complex engineering problem', indicator: 'Evaluate problem statements and identifies objectives' },
  { poNo: 'PO2', subCompetencyNo: '2.1', subCompetencyDesc: 'Demonstrate an ability to identify and formulate complex engineering problem', indicator: 'Identify processes/modules/algorithms of a computer-based system' },
  { poNo: 'PO2', subCompetencyNo: '2.2', subCompetencyDesc: 'Demonstrate an ability to formulate a solution plan', indicator: 'Compare and contrast alternative solution/methods to select the best methods' },
  { poNo: 'PO2', subCompetencyNo: '2.3', subCompetencyDesc: 'Demonstrate an ability to formulate and interpret a model', indicator: 'Apply computer engineering principles to formulate modules of a system' },
  { poNo: 'PO2', subCompetencyNo: '2.4', subCompetencyDesc: 'Demonstrate an ability to execute a solution process', indicator: 'Analyze and interpret the results using contemporary tools' },
  // PO3
  { poNo: 'PO3', subCompetencyNo: '3.1', subCompetencyDesc: 'Demonstrate an ability to define a complex open ended problem', indicator: 'Able to identify and document system requirements from stakeholders' },
  { poNo: 'PO3', subCompetencyNo: '3.2', subCompetencyDesc: 'Demonstrate an ability to generate diverse set of alternative design solutions', indicator: 'Ability to explore design alternatives' },
  { poNo: 'PO3', subCompetencyNo: '3.3', subCompetencyDesc: 'Demonstrate an ability to select an optimal design scheme', indicator: 'Ability to perform systematic evaluation of design concepts' },
  { poNo: 'PO3', subCompetencyNo: '3.4', subCompetencyDesc: 'Demonstrate an ability to advance an engineering design to a defined end state', indicator: 'Refine a conceptual design into a detailed design' },
  // PO4
  { poNo: 'PO4', subCompetencyNo: '4.1', subCompetencyDesc: 'Demonstrate an ability to conduct investigations', indicator: 'Define a problem for purpose of investigation' },
  { poNo: 'PO4', subCompetencyNo: '4.2', subCompetencyDesc: 'Demonstrate an ability to design experiments', indicator: 'Use appropriate procedures, tools and techniques to collect and analyze data' },
  { poNo: 'PO4', subCompetencyNo: '4.3', subCompetencyDesc: 'Demonstrate an ability to analyze data and reach a valid conclusion', indicator: 'Synthesize information and knowledge from the raw data' },
  // PO5
  { poNo: 'PO5', subCompetencyNo: '5.1', subCompetencyDesc: 'Demonstrate an ability to identify/create modern engineering tools', indicator: 'Identify modern engineering tools techniques and resources' },
  { poNo: 'PO5', subCompetencyNo: '5.2', subCompetencyDesc: 'Demonstrate an ability to select and apply discipline-specific tools', indicator: 'Demonstrate proficiency in using discipline specific tools' },
  { poNo: 'PO5', subCompetencyNo: '5.3', subCompetencyDesc: 'Demonstrate an ability to evaluate the suitability and limitations of tools', indicator: 'Discuss limitations and validate tools, techniques and resources' },
  // PO6
  { poNo: 'PO6', subCompetencyNo: '6.1', subCompetencyDesc: 'Demonstrate an ability to describe engineering roles in broader context', indicator: 'Identify and describe various engineering roles' },
  { poNo: 'PO6', subCompetencyNo: '6.2', subCompetencyDesc: 'Demonstrate an understanding of professional engineering regulations', indicator: 'Interpret legislation, regulations, codes, and standards' },
  // PO7
  { poNo: 'PO7', subCompetencyNo: '7.1', subCompetencyDesc: 'Demonstrate an understanding of the impact of engineering practices', indicator: 'Identify risks/impacts in the life-cycle of an engineering product' },
  { poNo: 'PO7', subCompetencyNo: '7.2', subCompetencyDesc: 'Demonstrate an ability to apply principles of sustainable design', indicator: 'Apply principles of preventive engineering and sustainable development' },
  // PO8
  { poNo: 'PO8', subCompetencyNo: '8.1', subCompetencyDesc: 'Demonstrate an ability to recognize ethical dilemmas', indicator: 'Identify situations of unethical professional conduct' },
  { poNo: 'PO8', subCompetencyNo: '8.2', subCompetencyDesc: 'Demonstrate an ability to apply the code of Ethics', indicator: 'Examine and apply moral & ethical principles to known case studies' },
  // PO9
  { poNo: 'PO9', subCompetencyNo: '9.1', subCompetencyDesc: 'Demonstrate an ability to form a team and define a role for each member', indicator: 'Implement the norms of practice of effective team work' },
  { poNo: 'PO9', subCompetencyNo: '9.2', subCompetencyDesc: 'Demonstrate effective individual and team operations', indicator: 'Demonstrate effective communication, problem solving, conflict resolution' },
  // PO10
  { poNo: 'PO10', subCompetencyNo: '10.1', subCompetencyDesc: 'Demonstrate an ability to comprehend technical literature', indicator: 'Produce clear, well-constructed, and well-supported written engineering documents' },
  { poNo: 'PO10', subCompetencyNo: '10.2', subCompetencyDesc: 'Demonstrate competence in listening, speaking, and presentation', indicator: 'Deliver effective oral presentations to technical and nontechnical audiences' },
  // PO11
  { poNo: 'PO11', subCompetencyNo: '11.1', subCompetencyDesc: 'Demonstrate an ability to evaluate the economics and financial performance', indicator: 'Analyze different forms of financial statements to evaluate the financial status' },
  { poNo: 'PO11', subCompetencyNo: '11.2', subCompetencyDesc: 'Demonstrate an ability to compare and contrast costs/benefits', indicator: 'Analyze and select the most appropriate proposal based on economic considerations' },
  { poNo: 'PO11', subCompetencyNo: '11.3', subCompetencyDesc: 'Demonstrate an ability to plan/manage an engineering activity', indicator: 'Use project management tools to schedule an engineering project' },
  // PSO1
  { poNo: 'PSO1', subCompetencyNo: '13.1', subCompetencyDesc: 'Identify the root causes of a given real-world problem', indicator: 'Plan a structured process for building the logic' },
  { poNo: 'PSO1', subCompetencyNo: '13.2', subCompetencyDesc: 'Design efficient system for addressing feasible solutions', indicator: 'Identify key issues and outcomes hierarchy' },
  // PSO2
  { poNo: 'PSO2', subCompetencyNo: '14.1', subCompetencyDesc: 'Demonstrate the ability to analyze complex problems', indicator: 'Decompose the complex problems into smaller, manageable components' },
  { poNo: 'PSO2', subCompetencyNo: '14.2', subCompetencyDesc: 'Demonstrate the ability to develop a structured problem-solving approach', indicator: 'Choose problem-solving methods and tools tailored to the specific domain' },
  // PSO3
  { poNo: 'PSO3', subCompetencyNo: '15.1', subCompetencyDesc: 'Demonstrate proficiency in evolving technologies', indicator: 'Apply acquired knowledge and skills in diverse domains' },
  { poNo: 'PSO3', subCompetencyNo: '15.2', subCompetencyDesc: 'Demonstrate professional growth', indicator: 'Exhibits ethical decision-making in engineering' }
];

module.exports = { PUNE_UNIVERSITY_POS, DEFAULT_PSOS, DEFAULT_PI_TEMPLATE };
