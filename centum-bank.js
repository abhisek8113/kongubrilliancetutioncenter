/* =============================================================================
   Kongu Brilliance — Centum Studio content bank
   -----------------------------------------------------------------------------
   This file holds ALL questions/notes. The engine (centum-studio.html) reads it
   at load time, so you can grow the bank to thousands of items WITHOUT touching
   the app code. Just add entries below and re-deploy.

   SCHEMA
   window.KB_BANK[board][standard][subject][topic] = {
     notes: {
       def:  "definition/intro (HTML allowed: <b> etc.)",
       heads:[ { h:"heading", pts:[ "point (HTML ok)", ... ] }, ... ],
       keys: [ "keyword", ... ]              // must-know terms
     },
     questions: [
       {
         q:"question text",
         type:"Very short | Short answer | Long answer",
         diff:"basic | advanced | very",     // hardness level
         marks: 1..5,
         key:[ "expected keyword", ... ],     // used to auto-mark answers
         model:"model answer (teacher's version)"
       }, ...
     ],
     mcqs: [
       { q:"stem", opts:["A","B","C","D"], ans:1, exp:"why", diff:"basic" }, ...
     ]
   }

   TIPS
   - key[] drives the auto-correction. List the phrases a full-mark answer must
     contain. More keys = stricter marking.
   - diff controls the Basic / Advanced / Very Advanced filter.
   - You can add any board ("ICSE", "ISC", "IGCSE"), any class ("Class 6"...),
     any subject or topic — the dropdowns build themselves from the keys here.
   ========================================================================== */
window.KB_BANK = {

/* ========================== C B S E ========================== */
"CBSE": {

 "Class 9": {
  "Science": {
   "Matter in Our Surroundings": {
    notes:{def:"<b>Matter</b> is anything that has mass and occupies space. It exists in three states — <b>solid, liquid and gas</b> — differing in the arrangement, spacing and movement of their particles.",
     heads:[
      {h:"Characteristics of particles of matter",pts:["Particles have space between them","Particles are continuously moving (kinetic energy)","Particles attract each other (force of attraction)"]},
      {h:"States and change of state",pts:["Solid → fixed shape and volume; particles closely packed","Liquid → fixed volume, no fixed shape","Gas → neither fixed shape nor volume; highly compressible","<b>Melting point</b>, <b>boiling point</b>, <b>sublimation</b> (solid → gas directly)","Latent heat: heat absorbed/released during a change of state at constant temperature"]},
      {h:"Evaporation",pts:["Surface phenomenon; occurs at all temperatures","Increases with temperature, surface area, wind speed; decreases with humidity","Causes cooling (absorbs latent heat from surroundings)"]}],
     keys:["mass","occupies space","states of matter","kinetic energy","latent heat","sublimation","evaporation","boiling point"]},
    questions:[
     {q:"Define matter. Name its three states with one property each.",type:"Short answer",diff:"basic",marks:2,key:["mass","occupies space","solid","liquid","gas"],model:"Matter is anything that has mass and occupies space. Solid — fixed shape and volume; liquid — fixed volume but no fixed shape; gas — neither fixed shape nor volume."},
     {q:"Why does evaporation cause cooling?",type:"Short answer",diff:"advanced",marks:2,key:["latent heat","surroundings","surface","cooling"],model:"During evaporation, particles at the surface absorb latent heat of vaporisation from the surroundings to escape as vapour. This loss of heat from the surroundings causes cooling."},
     {q:"Explain why the smell of hot food reaches you faster than cold food.",type:"Short answer",diff:"advanced",marks:3,key:["diffusion","kinetic energy","temperature","faster"],model:"On heating, particles gain kinetic energy and move faster, so the rate of diffusion of vapours increases. Hence the smell of hot food, with faster-moving particles, reaches us quicker than that of cold food."},
     {q:"Convert 470 K to Celsius and 25 °C to Kelvin, and define sublimation.",type:"Long answer",diff:"very",marks:3,key:["197","298","sublimation","solid","gas"],model:"470 K = 470 − 273 = 197 °C. 25 °C = 25 + 273 = 298 K. Sublimation is the change of a solid directly into gas (vapour) without passing through the liquid state."}],
    mcqs:[
     {q:"The state of matter with the highest compressibility is:",opts:["Solid","Liquid","Gas","All equal"],ans:2,exp:"Gases have large inter-particle spaces, so they compress the most.",diff:"basic"},
     {q:"Latent heat of vaporisation is the heat required to change:",opts:["Solid to liquid","Liquid to gas at its boiling point without temperature change","Gas to plasma","Temperature of water"],ans:1,exp:"It converts 1 kg of liquid to vapour at constant temperature.",diff:"advanced"}]},
   "Motion": {
    notes:{def:"<b>Motion</b> is a change in the position of an object with time. It is described using <b>distance, displacement, speed, velocity and acceleration</b>.",
     heads:[
      {h:"Basic quantities",pts:["<b>Distance</b>: total path length (scalar)","<b>Displacement</b>: shortest straight-line distance with direction (vector)","<b>Speed</b> = distance/time; <b>Velocity</b> = displacement/time","<b>Acceleration</b> = change in velocity / time"]},
      {h:"Equations of uniformly accelerated motion",pts:["v = u + at","s = ut + ½at²","v² = u² + 2as","where u = initial velocity, v = final velocity, a = acceleration, s = displacement, t = time"]}],
     keys:["distance","displacement","speed","velocity","acceleration","uniform","equations of motion"]},
    questions:[
     {q:"Differentiate between distance and displacement.",type:"Short answer",diff:"basic",marks:2,key:["path length","scalar","shortest","direction","vector"],model:"Distance is the total path length travelled (a scalar). Displacement is the shortest distance from initial to final position with direction (a vector)."},
     {q:"A car starting from rest accelerates uniformly at 4 m/s² for 10 s. Find its final velocity and the distance covered.",type:"Long answer",diff:"advanced",marks:3,key:["v=u+at","40","s=ut","200"],model:"u=0, a=4, t=10. v = u+at = 0+4×10 = 40 m/s. s = ut+½at² = 0+½×4×100 = 200 m."},
     {q:"Derive v² = u² + 2as using the other equations of motion.",type:"Long answer",diff:"very",marks:3,key:["v=u+at","s=ut","eliminate t","v²=u²+2as"],model:"From v=u+at, t=(v−u)/a. Substitute in s=ut+½at²: s=u(v−u)/a + ½a(v−u)²/a². Simplifying gives 2as = v²−u², i.e. v² = u² + 2as."}],
    mcqs:[
     {q:"The displacement of an object moving in a complete circle of radius r is:",opts:["2πr","πr","zero","r"],ans:2,exp:"Start and end points coincide, so displacement is zero.",diff:"basic"},
     {q:"A body has uniform velocity. Its acceleration is:",opts:["Constant non-zero","Zero","Increasing","Equal to velocity"],ans:1,exp:"Uniform velocity means no change in velocity, so acceleration is zero.",diff:"advanced"}]}
  },
  "Mathematics": {
   "Number Systems": {
    notes:{def:"The <b>number system</b> classifies numbers into natural, whole, integers, rational and irrational numbers, together forming the <b>real numbers</b>.",
     heads:[
      {h:"Types",pts:["<b>Rational</b>: can be written as p/q, q≠0 (terminating or recurring decimals)","<b>Irrational</b>: non-terminating, non-recurring decimals (√2, π)","Between any two rationals there are infinitely many rationals and irrationals"]},
      {h:"Laws of exponents for real numbers",pts:["aᵐ·aⁿ = aᵐ⁺ⁿ","(aᵐ)ⁿ = aᵐⁿ","aᵐ/aⁿ = aᵐ⁻ⁿ","a⁰ = 1"]}],
     keys:["rational","irrational","real numbers","terminating","recurring","exponents","rationalise"]},
    questions:[
     {q:"Define a rational number and give one example of an irrational number.",type:"Very short",diff:"basic",marks:2,key:["p/q","q≠0","irrational","√2"],model:"A rational number can be expressed as p/q where p, q are integers and q≠0. Example of an irrational number: √2 (or π)."},
     {q:"Rationalise the denominator of 1/(√5 − 2).",type:"Short answer",diff:"advanced",marks:3,key:["multiply","conjugate","√5+2","denominator","√5+2"],model:"Multiply numerator and denominator by the conjugate (√5+2): 1/(√5−2) × (√5+2)/(√5+2) = (√5+2)/((√5)²−2²) = (√5+2)/(5−4) = √5+2."},
     {q:"Show that 0.3̄ (0.333…) can be written as a rational number.",type:"Long answer",diff:"very",marks:3,key:["let x","10x","subtract","1/3"],model:"Let x = 0.333… Then 10x = 3.333… Subtracting: 10x − x = 3, so 9x = 3, x = 1/3, which is rational."}],
    mcqs:[
     {q:"Which of the following is irrational?",opts:["0.25","√9","√7","3/4"],ans:2,exp:"√7 is non-terminating non-recurring; √9=3 is rational.",diff:"basic"},
     {q:"The value of (2³)² is:",opts:["32","64","12","36"],ans:1,exp:"(2³)²=2⁶=64.",diff:"basic"}]}
  }
 },

 "Class 10": {
  "Science": {
   "Chemical Reactions & Equations": {
    notes:{def:"A <b>chemical reaction</b> converts reactants into new substances (products) with different properties. A <b>balanced chemical equation</b> has equal atoms of each element on both sides, obeying the Law of Conservation of Mass.",
     heads:[
      {h:"Signs a chemical reaction has occurred",pts:["Change in colour","Change in state","Evolution of a gas","Change in temperature","Formation of a precipitate"]},
      {h:"Types of chemical reactions",pts:["<b>Combination</b>: reactants → single product (CaO + H₂O → Ca(OH)₂)","<b>Decomposition</b>: single reactant → many products (2FeSO₄ →Δ Fe₂O₃ + SO₂ + SO₃)","<b>Displacement</b>: more reactive element displaces less reactive (Fe + CuSO₄ → FeSO₄ + Cu)","<b>Double displacement</b>: exchange of ions (Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl)","<b>Redox</b>: oxidation and reduction together"]},
      {h:"Oxidation, reduction, corrosion & rancidity",pts:["<b>Oxidation</b> = gain of oxygen / loss of hydrogen","<b>Reduction</b> = loss of oxygen / gain of hydrogen","<b>Corrosion</b>: slow oxidation of metals (rusting needs air + water)","<b>Rancidity</b>: oxidation of fats/oils — prevented by antioxidants, N₂ flushing, airtight packing"]}],
     keys:["balanced equation","conservation of mass","precipitate","exothermic","endothermic","oxidation","reduction","corrosion","rancidity"]},
    questions:[
     {q:"Define a balanced chemical equation. Why should chemical equations be balanced?",type:"Short answer",diff:"basic",marks:2,key:["equal number of atoms","both sides","conservation of mass","matter cannot be created"],model:"A balanced equation has equal numbers of atoms of each element on both sides. Equations must be balanced to obey the Law of Conservation of Mass — matter can neither be created nor destroyed."},
     {q:"State two observations that tell you a chemical reaction has taken place.",type:"Very short",diff:"basic",marks:2,key:["colour change","gas","temperature","precipitate","state"],model:"Any two: change in colour, evolution of a gas, change in temperature, formation of a precipitate, or change in state."},
     {q:"Distinguish between a combination and a decomposition reaction with one example each.",type:"Short answer",diff:"advanced",marks:3,key:["combination","single product","decomposition","two or more products","example"],model:"Combination: two+ reactants form a single product, e.g. CaO + H₂O → Ca(OH)₂. Decomposition: a single reactant breaks into two or more products, e.g. 2FeSO₄ → Fe₂O₃ + SO₂ + SO₃."},
     {q:"Why does the colour of copper sulphate solution change when an iron nail is dipped in it? Write the balanced equation and identify the type of reaction.",type:"Long answer",diff:"advanced",marks:3,key:["iron more reactive","displaces copper","FeSO4","displacement","blue to green"],model:"Iron is more reactive than copper, so it displaces copper from copper sulphate; blue fades to pale green as FeSO₄ forms: Fe + CuSO₄ → FeSO₄ + Cu. It is a displacement reaction."},
     {q:"Explain why respiration is an exothermic reaction, and why decomposition reactions are called the opposite of combination reactions.",type:"Long answer",diff:"very",marks:5,key:["glucose","oxygen","energy released","exothermic","decomposition","combination","opposite"],model:"In respiration glucose reacts with oxygen to release energy (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy), so it is exothermic. Decomposition breaks one substance into several using energy, whereas combination joins several into one — the reverse process."}],
    mcqs:[
     {q:"The reaction 2Pb(NO₃)₂ → 2PbO + 4NO₂ + O₂ is an example of:",opts:["Combination","Decomposition","Displacement","Double displacement"],ans:1,exp:"A single reactant breaks into multiple products on heating.",diff:"basic"},
     {q:"Rusting of iron is prevented by galvanisation because zinc:",opts:["Is cheaper","Is more reactive and corrodes first (sacrificial)","Is a non-metal","Forms rust"],ans:1,exp:"Zinc is more reactive, so it corrodes preferentially and protects the iron.",diff:"advanced"},
     {q:"In MnO₂ + 4HCl → MnCl₂ + Cl₂ + 2H₂O, the substance oxidised is:",opts:["MnO₂","HCl","MnCl₂","H₂O"],ans:1,exp:"HCl / Cl⁻ is oxidised to Cl₂ while MnO₂ is reduced.",diff:"very"}]},
   "Acids, Bases and Salts": {
    notes:{def:"<b>Acids</b> release H⁺ ions in aqueous solution, <b>bases</b> release OH⁻ ions. <b>Salts</b> are formed when an acid reacts with a base (neutralisation). Strength is measured on the <b>pH scale</b> (0–14).",
     heads:[
      {h:"Key properties",pts:["Acids turn blue litmus red; bases turn red litmus blue","Acid + Base → Salt + Water (neutralisation)","Acid + Metal → Salt + Hydrogen gas","Acid + Metal carbonate → Salt + Water + CO₂"]},
      {h:"pH scale",pts:["pH < 7 acidic, pH = 7 neutral, pH > 7 basic","Lower pH = more acidic","Importance: tooth decay below pH 5.5; soil pH for crops; antacids for acidity"]},
      {h:"Important salts",pts:["Common salt NaCl → source of NaOH, baking soda, washing soda, bleaching powder","Baking soda NaHCO₃; Washing soda Na₂CO₃·10H₂O; Plaster of Paris CaSO₄·½H₂O"]}],
     keys:["H+ ions","OH- ions","neutralisation","pH scale","litmus","baking soda","washing soda","plaster of paris"]},
    questions:[
     {q:"What is neutralisation? Write a word equation for it.",type:"Short answer",diff:"basic",marks:2,key:["acid","base","salt","water"],model:"Neutralisation is the reaction of an acid with a base to form salt and water: Acid + Base → Salt + Water."},
     {q:"Why does dry HCl gas not turn blue litmus red, but its aqueous solution does?",type:"Short answer",diff:"very",marks:3,key:["H+ ions","water","dissociate","dry"],model:"Acidic behaviour needs H⁺ ions, which form only when HCl dissolves in water and dissociates. Dry HCl has no free H⁺ ions, so it cannot turn litmus red; the aqueous solution does."},
     {q:"Give the chemical name and one use each of baking soda and plaster of Paris.",type:"Long answer",diff:"advanced",marks:3,key:["sodium hydrogen carbonate","NaHCO3","calcium sulphate","plaster","antacid"],model:"Baking soda = sodium hydrogen carbonate (NaHCO₃); used in cooking/antacids. Plaster of Paris = calcium sulphate hemihydrate (CaSO₄·½H₂O); used to set fractured bones and for casts."}],
    mcqs:[
     {q:"A solution turns red litmus blue. Its pH is likely:",opts:["1","4","7","10"],ans:3,exp:"Bases turn red litmus blue and have pH > 7.",diff:"basic"},
     {q:"Tooth decay begins when the pH of the mouth falls below:",opts:["7.0","5.5","3.0","9.0"],ans:1,exp:"Below pH 5.5 enamel starts to corrode.",diff:"advanced"}]},
   "Life Processes": {
    notes:{def:"<b>Life processes</b> are the basic functions that maintain life — <b>nutrition, respiration, transportation and excretion</b> — keeping cells supplied with energy and free of waste.",
     heads:[
      {h:"Nutrition",pts:["<b>Autotrophic</b>: make their own food by photosynthesis (green plants)","<b>Heterotrophic</b>: depend on others (holozoic, saprophytic, parasitic)","Photosynthesis: 6CO₂ + 6H₂O →(light, chlorophyll) C₆H₁₂O₆ + 6O₂"]},
      {h:"Respiration",pts:["<b>Aerobic</b>: glucose fully oxidised in mitochondria → CO₂ + H₂O + more energy","<b>Anaerobic</b>: without O₂ → ethanol/lactic acid + less energy","Energy stored as <b>ATP</b>"]},
      {h:"Transportation & Excretion",pts:["Humans: double circulation via four-chambered heart","Xylem carries water; phloem carries food","Excretion via <b>nephrons</b> in kidneys; plants use stomata, old xylem, falling leaves"]}],
     keys:["autotrophic","heterotrophic","photosynthesis","aerobic","anaerobic","ATP","double circulation","nephron","xylem","phloem"]},
    questions:[
     {q:"How is glucose broken down in the absence and presence of oxygen?",type:"Long answer",diff:"advanced",marks:3,key:["pyruvate","aerobic","mitochondria","anaerobic","lactic acid","ethanol","energy"],model:"Glucose first breaks into pyruvate in the cytoplasm. With oxygen (aerobic) pyruvate breaks in mitochondria to CO₂ + water with much energy. Without oxygen it forms ethanol + CO₂ (yeast) or lactic acid (muscles) with less energy."},
     {q:"Name the life processes essential for maintaining life.",type:"Very short",diff:"basic",marks:2,key:["nutrition","respiration","transportation","excretion"],model:"Nutrition, respiration, transportation, and excretion."},
     {q:"Why is double circulation necessary in human beings?",type:"Short answer",diff:"very",marks:3,key:["oxygenated","deoxygenated","separate","twice","efficient","high energy"],model:"Blood passes through the heart twice; oxygenated and deoxygenated blood stay separate, so highly oxygenated blood reaches tissues efficiently — needed for warm-blooded animals with high energy needs."}],
    mcqs:[
     {q:"Opening and closing of stomatal pores is controlled by:",opts:["Root hair","Guard cells","Xylem vessels","Companion cells"],ans:1,exp:"Turgidity of guard cells opens and closes the stoma.",diff:"basic"},
     {q:"The correct sequence in aerobic respiration is:",opts:["Glucose→pyruvate→lactic acid","Glucose→pyruvate→CO₂+H₂O","Glucose→ethanol→CO₂","Glucose→starch→CO₂"],ans:1,exp:"Pyruvate is oxidised in mitochondria to CO₂ and water.",diff:"advanced"}]},
   "Electricity": {
    notes:{def:"<b>Electric current</b> is the rate of flow of charge (I = Q/t). <b>Ohm's law</b> states that, at constant temperature, the current through a conductor is directly proportional to the potential difference across it: V = IR.",
     heads:[
      {h:"Key formulae",pts:["I = Q/t (ampere)","V = IR (Ohm's law)","Resistance R = ρL/A (depends on length, area, material)","Power P = VI = I²R = V²/R","Energy = P × t (kWh)"]},
      {h:"Combinations of resistors",pts:["Series: R = R₁ + R₂ + R₃ … (same current)","Parallel: 1/R = 1/R₁ + 1/R₂ … (same voltage)","Household wiring uses parallel connection"]}],
     keys:["electric current","Ohm's law","resistance","resistivity","series","parallel","power","V=IR"]},
    questions:[
     {q:"State Ohm's law and draw the shape of the V–I graph for a conductor.",type:"Short answer",diff:"basic",marks:2,key:["potential difference","proportional","current","V=IR","straight line"],model:"Ohm's law: at constant temperature, the current through a conductor is directly proportional to the potential difference across its ends, V = IR. The V–I graph is a straight line through the origin."},
     {q:"Three resistors of 2Ω, 3Ω and 6Ω are connected in parallel. Find the equivalent resistance.",type:"Long answer",diff:"advanced",marks:3,key:["1/R","1/2+1/3+1/6","1","1 ohm"],model:"1/R = 1/2 + 1/3 + 1/6 = (3+2+1)/6 = 6/6 = 1, so R = 1Ω."},
     {q:"An electric bulb is rated 220 V and 100 W. Calculate its resistance and the current drawn.",type:"Long answer",diff:"very",marks:3,key:["P=V²/R","484","I=P/V","0.45"],model:"R = V²/P = 220²/100 = 48400/100 = 484Ω. I = P/V = 100/220 ≈ 0.45 A."}],
    mcqs:[
     {q:"The SI unit of electric resistance is:",opts:["Ampere","Volt","Ohm","Watt"],ans:2,exp:"Resistance is measured in ohms (Ω).",diff:"basic"},
     {q:"To get maximum resistance from given resistors, connect them in:",opts:["Parallel","Series","Short circuit","Star"],ans:1,exp:"Series addition gives the largest total resistance.",diff:"advanced"}]}
  },
  "Mathematics": {
   "Real Numbers": {
    notes:{def:"<b>Real numbers</b> include all rational and irrational numbers. The <b>Fundamental Theorem of Arithmetic</b> states every composite number is a unique product of primes (apart from order).",
     heads:[
      {h:"Key results",pts:["HCF(a,b) × LCM(a,b) = a × b","A number is irrational if it cannot be written as p/q, q≠0","√2, √3, √5 are irrational (proved by contradiction)","Terminating decimals have denominators of the form 2ⁿ5ᵐ"]},
      {h:"Method — prime factorisation",pts:["Express each number as a product of primes","HCF = product of smallest powers of common primes","LCM = product of greatest powers of all primes"]}],
     keys:["fundamental theorem of arithmetic","HCF","LCM","irrational","prime factorisation","contradiction","terminating"]},
    questions:[
     {q:"Find the HCF and LCM of 96 and 404 by prime factorisation and verify HCF × LCM = product of the numbers.",type:"Long answer",diff:"advanced",marks:3,key:["96","404","prime","HCF","LCM","product"],model:"96 = 2⁵×3, 404 = 2²×101. HCF = 4, LCM = 9696. Check: 4 × 9696 = 38784 = 96 × 404. ✓"},
     {q:"State the Fundamental Theorem of Arithmetic.",type:"Very short",diff:"basic",marks:1,key:["composite","product of primes","unique"],model:"Every composite number can be expressed as a product of primes, and this factorisation is unique except for the order of the factors."},
     {q:"Prove that √5 is irrational.",type:"Long answer",diff:"very",marks:4,key:["assume rational","p/q","co-prime","contradiction","5 divides","irrational"],model:"Assume √5 = p/q (co-prime). Then 5q² = p², so 5 divides p, let p=5m; then q²=5m², so 5 divides q too — contradicting co-primeness. Hence √5 is irrational."}],
    mcqs:[
     {q:"The HCF of the smallest prime and the smallest composite number is:",opts:["1","2","4","8"],ans:1,exp:"Smallest prime 2, smallest composite 4; HCF=2.",diff:"basic"},
     {q:"If HCF(65,117) = 65m − 117, then m equals:",opts:["1","2","3","4"],ans:1,exp:"HCF=13; 65m−117=13 → m=2.",diff:"very"}]},
   "Quadratic Equations": {
    notes:{def:"A <b>quadratic equation</b> in x is of the form <b>ax² + bx + c = 0</b>, a≠0. Its roots can be found by factorisation, completing the square, or the quadratic formula.",
     heads:[
      {h:"Quadratic formula & discriminant",pts:["x = [−b ± √(b²−4ac)] / 2a","Discriminant D = b²−4ac","D > 0 → two distinct real roots","D = 0 → two equal real roots","D < 0 → no real roots"]},
      {h:"Nature & sum/product of roots",pts:["Sum of roots = −b/a","Product of roots = c/a"]}],
     keys:["ax²+bx+c","discriminant","b²-4ac","quadratic formula","real roots","factorisation"]},
    questions:[
     {q:"Find the discriminant of 2x² − 4x + 3 = 0 and state the nature of its roots.",type:"Short answer",diff:"advanced",marks:2,key:["b²-4ac","16-24","-8","no real roots"],model:"D = b²−4ac = (−4)² − 4×2×3 = 16 − 24 = −8. Since D < 0, the equation has no real roots."},
     {q:"Solve x² − 5x + 6 = 0 by factorisation.",type:"Short answer",diff:"basic",marks:2,key:["(x-2)","(x-3)","x=2","x=3"],model:"x² − 5x + 6 = (x−2)(x−3) = 0, so x = 2 or x = 3."},
     {q:"The sum of a number and its reciprocal is 10/3. Find the number.",type:"Long answer",diff:"very",marks:3,key:["x+1/x","3x²-10x+3","x=3","1/3"],model:"Let the number be x: x + 1/x = 10/3 → 3x² + 3 = 10x → 3x² − 10x + 3 = 0 → (3x−1)(x−3)=0 → x = 3 or 1/3."}],
    mcqs:[
     {q:"The roots of x² − 4 = 0 are:",opts:["2 and 2","−2 and 2","only 2","no real roots"],ans:1,exp:"x²=4 → x=±2.",diff:"basic"},
     {q:"If the roots are equal, the discriminant is:",opts:["Positive","Zero","Negative","Infinite"],ans:1,exp:"Equal roots ⇔ b²−4ac = 0.",diff:"advanced"}]}
  },
  "Social Science": {
   "Nationalism in India": {
    notes:{def:"Indian nationalism grew during the freedom struggle as people across regions united against British rule, shaped by movements led by <b>Mahatma Gandhi</b> such as Non-Cooperation, Civil Disobedience and the idea of Satyagraha.",
     heads:[
      {h:"Key movements",pts:["<b>Rowlatt Act (1919)</b> and Jallianwala Bagh massacre","<b>Non-Cooperation Movement (1920–22)</b>: boycott of schools, courts, foreign goods; called off after Chauri Chaura","<b>Civil Disobedience Movement (1930)</b>: began with the Dandi Salt March","<b>Salt</b> chosen as a symbol uniting all Indians"]},
      {h:"Ideas of the nation",pts:["Sense of collective belonging through symbols, folklore, songs, the image of Bharat Mata","Different groups (peasants, workers, business class, women) joined with their own hopes"]}],
     keys:["Satyagraha","Non-Cooperation","Civil Disobedience","Dandi march","Rowlatt Act","Bharat Mata","nationalism"]},
    questions:[
     {q:"What was the Salt March, and why was salt chosen as a symbol of protest?",type:"Long answer",diff:"advanced",marks:3,key:["Dandi","Gandhi","salt tax","every Indian","1930"],model:"In 1930 Gandhi led a march from Sabarmati to Dandi to make salt from seawater, breaking the salt law. Salt was chosen because the tax on it affected every Indian, rich and poor, making it a powerful symbol to unite the nation against British rule."},
     {q:"Explain the idea of Satyagraha.",type:"Short answer",diff:"basic",marks:2,key:["truth","non-violence","soul force","Gandhi"],model:"Satyagraha is the method of non-violent resistance based on the power of truth. It emphasises that if the cause is true, one can win the struggle without physical force, appealing to the conscience of the oppressor."},
     {q:"Why was the Non-Cooperation Movement called off in 1922?",type:"Short answer",diff:"very",marks:2,key:["Chauri Chaura","violence","Gandhi","withdrew"],model:"After the Chauri Chaura incident, where a mob set fire to a police station and killed policemen, Gandhi felt the movement was turning violent, against his principle of non-violence, and so he withdrew it."}],
    mcqs:[
     {q:"The Non-Cooperation Movement was withdrawn after the incident at:",opts:["Jallianwala Bagh","Chauri Chaura","Dandi","Champaran"],ans:1,exp:"The violent Chauri Chaura incident led Gandhi to call it off.",diff:"basic"},
     {q:"The Civil Disobedience Movement began with the:",opts:["Quit India speech","Salt (Dandi) March","Rowlatt Satyagraha","Poona Pact"],ans:1,exp:"It started with the Dandi Salt March in 1930.",diff:"advanced"}]}
  }
 },

 "Class 11": {
  "Physics": {
   "Units and Measurements": {
    notes:{def:"Physical quantities are measured in <b>units</b>. The <b>SI system</b> has seven base units. <b>Dimensional analysis</b> checks the correctness of equations and converts units.",
     heads:[
      {h:"SI base units",pts:["Length — metre (m)","Mass — kilogram (kg)","Time — second (s)","Electric current — ampere (A)","Temperature — kelvin (K)","Amount of substance — mole (mol)","Luminous intensity — candela (cd)"]},
      {h:"Dimensions",pts:["Velocity [M⁰L¹T⁻¹]","Force [M¹L¹T⁻²]","Energy/Work [M¹L²T⁻²]","Uses: checking equations, deriving relations, converting units"]}],
     keys:["SI units","base units","dimensional analysis","dimensions","significant figures","force","energy"]},
    questions:[
     {q:"Check the dimensional correctness of the equation v = u + at.",type:"Long answer",diff:"advanced",marks:3,key:["LT-1","at","LT-1","homogeneous","correct"],model:"[v] = LT⁻¹, [u] = LT⁻¹, [at] = (LT⁻²)(T) = LT⁻¹. All terms have the dimension LT⁻¹, so the equation is dimensionally homogeneous and correct."},
     {q:"Write the SI unit and dimensional formula of force.",type:"Very short",diff:"basic",marks:2,key:["newton","MLT-2"],model:"SI unit of force is the newton (N). Dimensional formula: [M¹L¹T⁻²]."},
     {q:"State two limitations of dimensional analysis.",type:"Short answer",diff:"very",marks:2,key:["dimensionless constant","trigonometric","cannot"],model:"It cannot find dimensionless constants (like ½ or 2π), and it cannot check equations involving trigonometric, exponential or logarithmic functions."}],
    mcqs:[
     {q:"The number of SI base units is:",opts:["5","6","7","9"],ans:2,exp:"There are seven SI base units.",diff:"basic"},
     {q:"The dimensional formula of work is:",opts:["MLT⁻²","ML²T⁻²","ML²T⁻¹","MLT⁻¹"],ans:1,exp:"Work = force × distance = ML²T⁻².",diff:"advanced"}]}
  },
  "Chemistry": {
   "Some Basic Concepts of Chemistry": {
    notes:{def:"Chemistry deals with matter, its composition and changes. The <b>mole concept</b> links the mass of a substance to the number of particles it contains, via <b>Avogadro's number (6.022×10²³)</b>.",
     heads:[
      {h:"Mole concept",pts:["1 mole = 6.022×10²³ particles = molar mass in grams","Moles = given mass / molar mass","Molar mass = sum of atomic masses"]},
      {h:"Laws & concentration",pts:["Law of conservation of mass","Law of constant proportions","Molarity (M) = moles of solute / litre of solution"]}],
     keys:["mole","Avogadro's number","molar mass","molarity","conservation of mass","constant proportions"]},
    questions:[
     {q:"Define one mole. What is Avogadro's number?",type:"Very short",diff:"basic",marks:2,key:["6.022","10²³","particles","molar mass"],model:"One mole is the amount of a substance containing as many particles as there are atoms in 12 g of carbon-12, i.e. 6.022×10²³ particles (Avogadro's number)."},
     {q:"Calculate the number of moles in 36 g of water.",type:"Short answer",diff:"advanced",marks:2,key:["molar mass","18","36/18","2 moles"],model:"Molar mass of water = 18 g/mol. Moles = 36/18 = 2 moles."},
     {q:"Calculate the molarity of a solution containing 4 g of NaOH in 500 mL of solution.",type:"Long answer",diff:"very",marks:3,key:["moles","40","0.1","0.5 L","0.2"],model:"Molar mass NaOH = 40. Moles = 4/40 = 0.1. Volume = 0.5 L. Molarity = 0.1/0.5 = 0.2 M."}],
    mcqs:[
     {q:"Avogadro's number is approximately:",opts:["6.022×10²³","3.0×10⁸","1.6×10⁻¹⁹","9.1×10⁻³¹"],ans:0,exp:"6.022×10²³ particles per mole.",diff:"basic"},
     {q:"The molar mass of CO₂ (C=12, O=16) is:",opts:["28","44","32","48"],ans:1,exp:"12 + 2×16 = 44 g/mol.",diff:"advanced"}]}
  }
 },

 "Class 12": {
  "Physics": {
   "Electrostatics": {
    notes:{def:"<b>Electrostatics</b> studies charges at rest. <b>Coulomb's law</b>: force between two point charges ∝ product of charges and ∝ 1/r²: F = (1/4πε₀)·q₁q₂/r².",
     heads:[
      {h:"Core quantities",pts:["<b>Electric field</b> E = F/q (N/C or V/m)","<b>Potential</b> V = W/q; point charge V = kq/r","<b>Flux</b> Φ = E·A·cosθ","<b>Gauss's law</b>: Φ = q_enclosed/ε₀"]},
      {h:"Capacitors",pts:["C = Q/V","Parallel plate: C = ε₀A/d","Series: 1/C = Σ1/Cᵢ; Parallel: C = ΣCᵢ","Energy U = ½CV²"]}],
     keys:["Coulomb's law","electric field","potential","Gauss's law","flux","capacitance","dielectric","permittivity"]},
    questions:[
     {q:"State Gauss's law and use it to find the field due to an infinitely long straight charged wire.",type:"Long answer",diff:"very",marks:5,key:["Gauss","flux","enclosed charge","cylindrical","linear charge density","2πε₀r"],model:"Gauss's law: net flux through a closed surface = enclosed charge / ε₀. For a coaxial cylinder radius r, length l around a wire of density λ: E·2πrl = λl/ε₀ → E = λ/(2πε₀r), radially outward."},
     {q:"Define electric field intensity and state its SI unit.",type:"Very short",diff:"basic",marks:2,key:["force per unit charge","test charge","N/C","V/m"],model:"Force experienced by a unit positive test charge, E = F/q. SI unit: N/C or V/m."},
     {q:"Two capacitors 2μF and 3μF are in series across 10V. Find the equivalent capacitance and charge on each.",type:"Long answer",diff:"advanced",marks:3,key:["series","1.2","charge","Q=CV","12"],model:"Series: 1/C = 1/2 + 1/3 → C = 1.2μF. Same charge in series: Q = CV = 1.2×10 = 12μC on each."}],
    mcqs:[
     {q:"The electric field inside a charged hollow conductor is:",opts:["Maximum at centre","Zero everywhere inside","Equal to surface value","Infinite"],ans:1,exp:"Enclosed charge is zero, so field inside is zero.",diff:"basic"},
     {q:"Introducing a dielectric into an isolated charged capacitor, the stored energy:",opts:["Increases","Decreases","Same","Zero"],ans:1,exp:"Constant Q: C increases so U=Q²/2C decreases.",diff:"very"}]},
   "Current Electricity": {
    notes:{def:"<b>Current electricity</b> deals with charges in motion. Key ideas include <b>drift velocity</b>, <b>Ohm's law</b>, resistivity, and <b>Kirchhoff's laws</b> for circuit analysis.",
     heads:[
      {h:"Core relations",pts:["I = nAeV_d (drift velocity)","V = IR; R = ρL/A","Resistivity increases with temperature for conductors","EMF and terminal voltage: V = EMF − Ir"]},
      {h:"Kirchhoff's laws",pts:["<b>Junction rule</b>: Σ currents in = Σ currents out (charge conservation)","<b>Loop rule</b>: Σ EMF = Σ IR around a loop (energy conservation)"]}],
     keys:["drift velocity","Ohm's law","resistivity","EMF","internal resistance","Kirchhoff","terminal voltage"]},
    questions:[
     {q:"State Kirchhoff's two laws.",type:"Short answer",diff:"advanced",marks:2,key:["junction","currents","loop","EMF","IR"],model:"Junction rule: the algebraic sum of currents at a junction is zero (Σ in = Σ out), from charge conservation. Loop rule: around any closed loop, the algebraic sum of EMFs equals the sum of IR drops, from energy conservation."},
     {q:"Define drift velocity.",type:"Very short",diff:"basic",marks:2,key:["average velocity","electrons","electric field"],model:"Drift velocity is the average velocity attained by free electrons in a conductor due to an applied electric field, opposite to the field direction."},
     {q:"A cell of EMF 2V and internal resistance 0.5Ω is connected to a 3.5Ω resistor. Find the current and terminal voltage.",type:"Long answer",diff:"very",marks:3,key:["I=EMF/(R+r)","0.5","terminal","1.75"],model:"I = EMF/(R+r) = 2/(3.5+0.5) = 2/4 = 0.5 A. Terminal voltage V = IR = 0.5×3.5 = 1.75 V."}],
    mcqs:[
     {q:"Kirchhoff's junction rule is based on conservation of:",opts:["Energy","Charge","Momentum","Mass"],ans:1,exp:"It expresses conservation of charge.",diff:"basic"},
     {q:"With rise in temperature, the resistivity of a metallic conductor:",opts:["Increases","Decreases","Stays same","Becomes zero"],ans:0,exp:"More collisions at higher temperature raise resistivity.",diff:"advanced"}]}
  },
  "Chemistry": {
   "Solutions": {
    notes:{def:"A <b>solution</b> is a homogeneous mixture of two or more substances. <b>Concentration</b> is expressed by molarity, molality, mole fraction, etc. <b>Colligative properties</b> depend on the number of solute particles, not their nature.",
     heads:[
      {h:"Concentration terms",pts:["Molarity (M) = moles solute / L solution","Molality (m) = moles solute / kg solvent","Mole fraction = moles of component / total moles"]},
      {h:"Colligative properties",pts:["Relative lowering of vapour pressure (Raoult's law)","Elevation of boiling point","Depression of freezing point","Osmotic pressure π = CRT"]}],
     keys:["solution","molarity","molality","mole fraction","colligative","Raoult's law","osmotic pressure"]},
    questions:[
     {q:"Define molality. How does it differ from molarity?",type:"Short answer",diff:"advanced",marks:2,key:["moles solute","kg solvent","molarity","temperature"],model:"Molality = moles of solute per kg of solvent. Unlike molarity (per litre of solution), molality does not change with temperature because mass, not volume, is used."},
     {q:"State Raoult's law for a solution of two volatile liquids.",type:"Very short",diff:"basic",marks:2,key:["partial vapour pressure","mole fraction","proportional"],model:"For a solution of two volatile liquids, the partial vapour pressure of each component is directly proportional to its mole fraction in the solution."},
     {q:"Why are colligative properties useful for determining molar mass?",type:"Short answer",diff:"very",marks:3,key:["number of particles","independent of nature","measure","molar mass"],model:"Colligative properties depend only on the number of solute particles, not their nature. By measuring a property like freezing-point depression for a known mass, the number of moles — and hence molar mass — can be calculated."}],
    mcqs:[
     {q:"Which is a colligative property?",opts:["Viscosity","Osmotic pressure","Density","Refractive index"],ans:1,exp:"Osmotic pressure depends on particle number.",diff:"basic"},
     {q:"Molality is preferred over molarity because it is independent of:",opts:["Pressure","Temperature","Solute","Solvent"],ans:1,exp:"Mass-based, so temperature-independent.",diff:"advanced"}]}
  },
  "Biology": {
   "Sexual Reproduction in Flowering Plants": {
    notes:{def:"In flowering plants, <b>sexual reproduction</b> involves the formation of gametes in flowers, <b>pollination</b>, <b>fertilisation</b>, and the development of seeds and fruits.",
     heads:[
      {h:"Key structures & events",pts:["Stamen (anther + filament) → pollen (male gametophyte)","Pistil (stigma, style, ovary) → ovule (female gametophyte / embryo sac)","<b>Pollination</b>: transfer of pollen to stigma (self / cross)","<b>Double fertilisation</b>: one male gamete + egg → zygote; other + two polar nuclei → endosperm"]},
      {h:"After fertilisation",pts:["Ovule → seed; Ovary → fruit","Endosperm nourishes the developing embryo"]}],
     keys:["stamen","pistil","pollination","double fertilisation","zygote","endosperm","ovule","embryo sac"]},
    questions:[
     {q:"What is double fertilisation?",type:"Short answer",diff:"advanced",marks:2,key:["two male gametes","zygote","endosperm","polar nuclei"],model:"Double fertilisation is the fusion of one male gamete with the egg to form the zygote, and the other male gamete with the two polar nuclei to form the triploid endosperm — both occurring in the same embryo sac."},
     {q:"Distinguish between self-pollination and cross-pollination.",type:"Short answer",diff:"basic",marks:2,key:["same flower","different flower","same plant","genetic variation"],model:"Self-pollination is the transfer of pollen to the stigma of the same flower or another flower on the same plant. Cross-pollination transfers pollen to a flower on a different plant of the same species, promoting genetic variation."},
     {q:"What happens to the ovule and ovary after fertilisation?",type:"Very short",diff:"basic",marks:2,key:["ovule","seed","ovary","fruit"],model:"After fertilisation the ovule develops into the seed and the ovary develops into the fruit."}],
    mcqs:[
     {q:"The endosperm in angiosperms is usually:",opts:["Haploid","Diploid","Triploid","Tetraploid"],ans:2,exp:"Formed from one male gamete + two polar nuclei = triploid.",diff:"advanced"},
     {q:"The male gametophyte in flowering plants is the:",opts:["Ovule","Pollen grain","Embryo sac","Endosperm"],ans:1,exp:"Pollen grain is the male gametophyte.",diff:"basic"}]}
  }
 }
},

/* ================== T A M I L   N A D U   S T A T E   B O A R D ================== */
"Tamil Nadu State Board": {
 "Class 10": {
  "Mathematics": {
   "Relations and Functions": {
    notes:{def:"A <b>relation</b> from A to B is a subset of A×B. A <b>function</b> f: A→B is a relation where every element of A has exactly one image in B.",
     heads:[
      {h:"Types of functions",pts:["<b>One-one (injective)</b>: different inputs → different outputs","<b>Onto (surjective)</b>: every element of B is an image","<b>Bijective</b>: one-one and onto","<b>Constant</b>: all inputs → same output","<b>Identity</b>: f(x)=x"]},
      {h:"Key ideas",pts:["n(A)=p, n(B)=q → n(A×B)=pq","Number of relations = 2^(pq)","Composition (f∘g)(x)=f(g(x))"]}],
     keys:["relation","function","Cartesian product","one-one","onto","bijective","composition","domain","range"]},
    questions:[
     {q:"If A={1,2,3} and B={x,y}, write A×B and find n(A×B).",type:"Short answer",diff:"basic",marks:2,key:["ordered pairs","6","cartesian"],model:"A×B = {(1,x),(1,y),(2,x),(2,y),(3,x),(3,y)}; n(A×B)=6."},
     {q:"Let f(x)=2x+1 and g(x)=x². Find (f∘g)(x) and (g∘f)(x). Are they equal?",type:"Long answer",diff:"advanced",marks:3,key:["f(g(x))","2x²+1","g(f(x))","(2x+1)²","not equal"],model:"(f∘g)(x)=2x²+1; (g∘f)(x)=(2x+1)²=4x²+4x+1. Not equal — composition is not commutative."},
     {q:"Prove that f: R→R, f(x)=3x−5 is a bijection.",type:"Long answer",diff:"very",marks:5,key:["one-one","f(a)=f(b)","onto","every y","bijection"],model:"One-one: f(a)=f(b) → 3a−5=3b−5 → a=b. Onto: for any y, x=(y+5)/3 gives f(x)=y. Both hold, so f is a bijection."}],
    mcqs:[
     {q:"If n(A)=4 and n(B)=3, the number of relations from A to B is:",opts:["12","2¹²","3⁴","4³"],ans:1,exp:"Relations = 2^(4×3)=2¹².",diff:"advanced"},
     {q:"The function f(x)=x for all x is called:",opts:["Constant","Identity","Onto","Zero"],ans:1,exp:"f(x)=x is the identity function.",diff:"basic"}]},
   "Numbers and Sequences": {
    notes:{def:"This chapter covers <b>Euclid's division lemma</b>, the <b>Fundamental Theorem of Arithmetic</b>, and <b>arithmetic & geometric progressions</b>.",
     heads:[
      {h:"Progressions",pts:["AP: nth term aₙ = a + (n−1)d","AP sum Sₙ = n/2 [2a + (n−1)d]","GP: nth term aₙ = a·rⁿ⁻¹","GP sum Sₙ = a(rⁿ−1)/(r−1), r≠1"]},
      {h:"Euclid's division lemma",pts:["a = bq + r, where 0 ≤ r < b","Used to find HCF by the division algorithm"]}],
     keys:["Euclid's division lemma","arithmetic progression","geometric progression","common difference","common ratio","nth term"]},
    questions:[
     {q:"Find the 10th term of the AP: 3, 7, 11, 15, …",type:"Short answer",diff:"basic",marks:2,key:["a=3","d=4","a+(n-1)d","39"],model:"a=3, d=4. a₁₀ = a + 9d = 3 + 9×4 = 39."},
     {q:"Find the sum of the first 20 terms of the AP: 5, 9, 13, …",type:"Long answer",diff:"advanced",marks:3,key:["a=5","d=4","Sn","n/2","860"],model:"a=5, d=4, n=20. Sₙ = n/2[2a+(n−1)d] = 10[10 + 19×4] = 10×86 = 860."},
     {q:"Find the number of terms in the GP: 3, 6, 12, …, 384.",type:"Long answer",diff:"very",marks:3,key:["a=3","r=2","arⁿ⁻¹","128","n=8"],model:"a=3, r=2, aₙ=384. 3·2ⁿ⁻¹ = 384 → 2ⁿ⁻¹ = 128 = 2⁷ → n−1=7 → n=8."}],
    mcqs:[
     {q:"The common difference of the AP 7, 4, 1, −2, … is:",opts:["3","−3","4","−1"],ans:1,exp:"4−7 = −3.",diff:"basic"},
     {q:"In a GP, if a=2 and r=3, the 4th term is:",opts:["18","54","162","24"],ans:1,exp:"a·r³ = 2×27 = 54.",diff:"advanced"}]}
  },
  "Science": {
   "Laws of Motion": {
    notes:{def:"<b>Newton's laws of motion</b> relate a body's motion to the forces on it: the first defines inertia, the second gives F=ma (rate of change of momentum), the third states action = reaction.",
     heads:[
      {h:"The three laws",pts:["<b>First (inertia)</b>: a body stays at rest / uniform motion unless an external force acts","<b>Second</b>: F = ma = rate of change of momentum","<b>Third</b>: every action has an equal and opposite reaction"]},
      {h:"Momentum & impulse",pts:["Momentum p = mv","Impulse = F×t = change in momentum","<b>Conservation of momentum</b>: total before = total after (no external force)"]}],
     keys:["inertia","force","momentum","impulse","conservation of momentum","action","reaction","F=ma"]},
    questions:[
     {q:"State Newton's second law and derive F = ma.",type:"Long answer",diff:"advanced",marks:3,key:["rate of change of momentum","p=mv","proportional","ma"],model:"Rate of change of momentum ∝ applied force, in the direction of the force. p=mv; F ∝ m(v−u)/t = ma. Taking k=1, F = ma."},
     {q:"Define inertia and name its three types.",type:"Short answer",diff:"basic",marks:2,key:["resist change","rest","motion","direction"],model:"Inertia is the tendency to resist change in state of rest or motion. Types: inertia of rest, motion, and direction."},
     {q:"A bullet of mass 20g leaves a 5kg gun at 400 m/s. Find the recoil velocity of the gun.",type:"Long answer",diff:"very",marks:3,key:["conservation of momentum","0.02","400","1.6"],model:"m₁v₁ = m₂v₂: 0.02×400 = 5×v → v = 1.6 m/s (recoil, opposite direction)."}],
    mcqs:[
     {q:"The SI unit of momentum is:",opts:["kg m/s","kg m/s²","N","J"],ans:0,exp:"p=mv → kg·m/s.",diff:"basic"},
     {q:"A karate player breaks a slab with a quick hit because short impact time gives:",opts:["Less force","Larger force for the same momentum change","Zero impulse","More mass"],ans:1,exp:"F=Δp/t; smaller t → larger force.",diff:"advanced"}]},
   "Optics": {
    notes:{def:"<b>Optics</b> studies light and its behaviour — reflection, refraction, and image formation by mirrors and lenses.",
     heads:[
      {h:"Mirrors & lenses",pts:["Mirror formula: 1/v + 1/u = 1/f","Lens formula: 1/v − 1/u = 1/f","Magnification m = h'/h = −v/u (mirror), v/u (lens)","Power of a lens P = 1/f (in metres), unit dioptre"]},
      {h:"Refraction",pts:["Refraction is bending of light as it passes between media","Refractive index n = c/v = sin i / sin r (Snell's law)","Total internal reflection occurs beyond the critical angle"]}],
     keys:["reflection","refraction","mirror formula","lens formula","magnification","refractive index","total internal reflection","dioptre"]},
    questions:[
     {q:"State the lens formula and define the power of a lens.",type:"Short answer",diff:"basic",marks:2,key:["1/v-1/u=1/f","power","1/f","dioptre"],model:"Lens formula: 1/v − 1/u = 1/f. The power of a lens is the reciprocal of its focal length in metres, P = 1/f, measured in dioptres (D)."},
     {q:"An object is placed 20 cm from a convex lens of focal length 10 cm. Find the image distance.",type:"Long answer",diff:"advanced",marks:3,key:["1/v-1/u","u=-20","f=10","v=20"],model:"1/v − 1/u = 1/f → 1/v = 1/f + 1/u = 1/10 + (1/−20) = 1/20. So v = 20 cm (real image on the other side)."},
     {q:"What is total internal reflection? State its two conditions.",type:"Short answer",diff:"very",marks:3,key:["denser","rarer","critical angle","reflected"],model:"Total internal reflection is when light travelling from a denser to a rarer medium is completely reflected back. Conditions: (1) light must go from denser to rarer medium; (2) the angle of incidence must exceed the critical angle."}],
    mcqs:[
     {q:"The power of a lens of focal length 50 cm is:",opts:["0.5 D","2 D","50 D","5 D"],ans:1,exp:"P = 1/f(m) = 1/0.5 = 2 D.",diff:"basic"},
     {q:"Total internal reflection can occur when light travels from:",opts:["Rarer to denser","Denser to rarer beyond critical angle","Air to glass","Vacuum to water"],ans:1,exp:"Only denser→rarer above the critical angle.",diff:"advanced"}]}
  },
  "Social Science": {
   "Outbreak of World War I and Its Aftermath": {
    notes:{def:"<b>World War I (1914–1918)</b> was a global conflict caused by militarism, alliances, imperialism and nationalism (MAIN), triggered by the assassination of Archduke Franz Ferdinand.",
     heads:[
      {h:"Causes (MAIN)",pts:["<b>Militarism</b> — arms race between powers","<b>Alliances</b> — Triple Alliance vs Triple Entente","<b>Imperialism</b> — competition for colonies","<b>Nationalism</b> — rivalries in Europe"]},
      {h:"Consequences",pts:["Immediate cause: assassination of Archduke Franz Ferdinand at Sarajevo (1914)","Treaty of Versailles (1919) punished Germany","League of Nations formed to prevent future wars"]}],
     keys:["militarism","alliances","imperialism","nationalism","Franz Ferdinand","Treaty of Versailles","League of Nations"]},
    questions:[
     {q:"What was the immediate cause of the First World War?",type:"Very short",diff:"basic",marks:2,key:["assassination","Franz Ferdinand","Sarajevo"],model:"The immediate cause was the assassination of Archduke Franz Ferdinand of Austria-Hungary at Sarajevo in 1914."},
     {q:"Explain the MAIN causes of the First World War.",type:"Long answer",diff:"advanced",marks:4,key:["militarism","alliances","imperialism","nationalism"],model:"The long-term causes are summarised as MAIN: Militarism (the arms race), Alliances (Triple Alliance vs Triple Entente drawing nations into war), Imperialism (rivalry over colonies), and Nationalism (competing national interests in Europe)."},
     {q:"Why was the Treaty of Versailles resented by Germany?",type:"Short answer",diff:"very",marks:3,key:["war guilt","reparations","territory","harsh"],model:"The treaty forced Germany to accept sole war guilt, pay huge reparations, lose territory and colonies, and reduce its army. Germans saw these harsh terms as humiliating, fuelling later resentment."}],
    mcqs:[
     {q:"World War I began in the year:",opts:["1905","1914","1919","1939"],ans:1,exp:"The war began in 1914.",diff:"basic"},
     {q:"The organisation formed after WWI to maintain peace was the:",opts:["United Nations","League of Nations","NATO","Warsaw Pact"],ans:1,exp:"The League of Nations was created in 1919–20.",diff:"advanced"}]}
  }
 },
 "Class 12": {
  "Physics": {
   "Electrostatics": {
    notes:{def:"<b>Electrostatics</b> is the study of charges at rest, governed by <b>Coulomb's law</b> and described using electric field, potential and Gauss's law.",
     heads:[
      {h:"Core ideas",pts:["Coulomb's law: F = (1/4πε₀)·q₁q₂/r²","Electric field E = F/q","Electric potential V = W/q","Gauss's law: Φ = q_enclosed/ε₀"]},
      {h:"Capacitance",pts:["C = Q/V; parallel plate C = ε₀A/d","Energy stored U = ½CV²","Effect of dielectric: capacitance increases by factor K"]}],
     keys:["Coulomb's law","electric field","potential","Gauss's law","capacitance","dielectric constant"]},
    questions:[
     {q:"Define electric potential at a point. State its SI unit.",type:"Very short",diff:"basic",marks:2,key:["work done","unit positive charge","volt"],model:"Electric potential at a point is the work done in bringing a unit positive charge from infinity to that point. SI unit: volt (V)."},
     {q:"Derive the expression for the capacitance of a parallel plate capacitor.",type:"Long answer",diff:"advanced",marks:3,key:["E=σ/ε₀","V=Ed","C=Q/V","ε₀A/d"],model:"Field between plates E = σ/ε₀ = Q/(ε₀A). Potential difference V = Ed = Qd/(ε₀A). So C = Q/V = ε₀A/d."},
     {q:"How does inserting a dielectric of constant K affect the capacitance and stored energy of a capacitor connected to a battery?",type:"Long answer",diff:"very",marks:3,key:["capacitance","K times","voltage constant","energy increases"],model:"With a battery connected, voltage stays constant. Capacitance becomes K times larger (C' = KC). Since U = ½CV², the stored energy also increases K times."}],
    mcqs:[
     {q:"The SI unit of capacitance is the:",opts:["Ohm","Farad","Henry","Tesla"],ans:1,exp:"Capacitance is measured in farads.",diff:"basic"},
     {q:"On inserting a dielectric (battery connected), the charge on the capacitor:",opts:["Decreases","Increases","Stays same","Becomes zero"],ans:1,exp:"Constant V, larger C → Q=CV increases.",diff:"advanced"}]}
  }
 }
}

};
