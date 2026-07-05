/* DELF B1 – Grammar Practice Center
 * Ứng dụng thuần JavaScript, lưu tiến độ và ghi chú bằng localStorage.
 */
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1YFaJsXJTqSx6uHM-JiE21w3QQ0O2eGNzHn74Jk4L0ME/edit?gid=2114291577#gid=2114291577";
const STORAGE_KEY = "delfB1GrammarPractice_v1";

const weeklyTopics = [
  ["Discours indirect au présent","Discours indirect au passé","Présent → imparfait","Passé composé → plus-que-parfait","Futur simple → conditionnel présent","Transformation directe → indirecte","Révision"],
  ["Expression de l’opinion","Je pense que / Je trouve que / Selon moi","Accord et désaccord","Cause : parce que / car / comme","Conséquence : donc / alors / c’est pourquoi","But : pour / afin de","Révision"],
  ["Subjonctif présent","Il faut que + subjonctif","Pour que + subjonctif","Bien que + subjonctif","Verbes de sentiment + subjonctif","Indicatif ou subjonctif","Révision"],
  ["Comparatif","Superlatif","Ne... que","Adverbes en -ment","Sans + infinitif","Pronoms relatifs qui / que / où / dont","Révision"],
  ["Voix passive","Présent passif","Passé composé passif","Futur passif","Gérondif","Double pronoms","Révision"],
  ["Conditionnel présent","Conditionnel passé","Hypothèse avec si","Plus-que-parfait","Connecteurs logiques","Articulations chronologiques","Révision finale","Mini test final DELF B1"]
];

const GOOGLE_DOC_URL = "https://docs.google.com/document/d/1jDOXkLqLHF2qRvccMJYQBqrh7lDazVG6J2VNkz8Lff8/edit";
const GOOGLE_DOC_TOPIC_LINKS = [
  "?tab=t.0#heading=h.u2q8jiicr1fr","?tab=t.t2ivt23x1pky#heading=h.jyormhntspwj","?tab=t.pid0a1rclqc4#heading=h.dejnulr2n63z","?tab=t.mso9suep9j78#heading=h.b7oyy49rpxxr","?tab=t.a3kb266epr03#heading=h.6y82w0d7w6hw","?tab=t.dvr9n6lun3m3#heading=h.kl26lzkbzrhm","?tab=t.ikk58d1y9y0p#heading=h.gyf0c64rr9az",
  "?tab=t.abi9lrxa54kb#heading=h.cwuug89rmxzw","?tab=t.s3d6wss0bbpj#heading=h.blmq81qo2r73","?tab=t.roubrht6taq8#heading=h.9zcl30rtfav2","?tab=t.cmjspqdu61el#heading=h.a2yb60h7yz0q","?tab=t.p7w0nvhvcn7j#heading=h.3axackdb6rn7","?tab=t.uwu5qkf9ns8s#heading=h.495bb19gsq5q","?tab=t.oazu6jhlmksi#heading=h.vepe63aev0ar",
  "?tab=t.n7xf30bx2m2c#heading=h.9epz2i672bp2","?tab=t.o5v36u5v7hk2#heading=h.r0tostrpdyak","?tab=t.e13tc6dbrof0#heading=h.warp6muplrbm","?tab=t.l253s7fedout#heading=h.fg6gb51myzwq","?tab=t.khohl9qt4fvy#heading=h.dpdy9fsvc77c","?tab=t.7id3r7887njj#heading=h.5qcnbm401mjo","?tab=t.chi1jemddxu0#heading=h.pka783rzq2xm",
  "?tab=t.iw15skbt1d8n#heading=h.wq4d409by8ug","?tab=t.z1snenm9gqwc#heading=h.a99ut7ydzs65","?tab=t.bo32rv6ba09z#heading=h.waof1el4ibbm","?tab=t.xkrjakbbn4rx#heading=h.nmxmt4ijvyaw","?tab=t.2d4vms9yyg6w#heading=h.3r1k40uicmbo","?tab=t.3yqncqwf9wud#heading=h.j82f2hlp4ucw","?tab=t.v7fb5tq7t7yf#heading=h.oove9z5uaf5o",
  "?tab=t.sm0wj43e64mz#heading=h.7kit36vkkm4j","?tab=t.7ofo6bifobfx#heading=h.frqi08jhzog8","?tab=t.6oltrtmjaxvt#heading=h.x4v3k1rk9jb9","?tab=t.vnzitrm68rmk#heading=h.4sblqp6unx1","?tab=t.bq3j02f5mdz2#heading=h.tp24pg4f34mk","?tab=t.4k6ha8qi9jt4#heading=h.jd6oc4nl0jwq","?tab=t.n89k11xbb5ae#heading=h.7ja71lxk9qfo",
  "?tab=t.ep9ylumo62k3#heading=h.1x3ezmvwfeya","?tab=t.n5h9fwq0k7p#heading=h.sh3ibb9465s6","?tab=t.6y5hmk5dnr3#heading=h.83oiijchw88l","?tab=t.zdw3eului36t#heading=h.6isalpbi907g","?tab=t.gymbpppz12o1#heading=h.bgwo6mm30zq8","?tab=t.cnmdrfb7jepr#heading=h.34365hdm0m8d","?tab=t.1u6pezg0jz1o#heading=h.gqz3dklmbct2","?tab=t.1p91a1rlml03#heading=h.wquboae5p34d"
];

const ruleProfiles = {
  discoursePresent: {
    formula:"Verbe introducteur au présent + que + phrase (temps inchangé)",
    explanation:"Dùng để thuật lại lời nói ở hiện tại. Thì của động từ thường không đổi, nhưng đại từ và tính từ sở hữu phải đổi theo người nói.",
    examples:["Il dit : « Je suis fatigué. » → Il dit qu’il est fatigué.","Elle demande : « Tu viens ? » → Elle demande si je viens."],
    mistakes:["Quên thêm que hoặc si.","Giữ nguyên đại từ je/tu dù người nói đã thay đổi."],
    q:["Il dit qu’il est prêt.","Il dit qu’il était prêt.","Il dit il est prêt.","Il dit que je suis prêt."],
    fill:["Elle dit ______ elle comprend.","qu’"], conjugation:["Il dit que nous ______ prêts. (être)","sommes"],
    transform:["Transformez : Paul dit : « Je travaille à Paris. »","Paul dit qu’il travaille à Paris."],
    rewrite:["Réécrivez avec si : Elle demande : « Tu as compris ? »","Elle demande si j’ai compris."],
    tf:["Au discours indirect au présent, le temps change toujours.","Faux"], tokens:["Il","dit","qu’il","est","fatigué."]
  },
  discoursePast: {
    formula:"Verbe introducteur au passé + concordance des temps",
    explanation:"Khi động từ dẫn ở quá khứ, présent thường lùi về imparfait, passé composé về plus-que-parfait và futur về conditionnel présent.",
    examples:["Il a dit : « Je suis prêt. » → Il a dit qu’il était prêt.","Elle a dit : « J’ai fini. » → Elle a dit qu’elle avait fini."],
    mistakes:["Không lùi thì sau il a dit que.","Nhầm imparfait với plus-que-parfait."],
    q:["Il a dit qu’il était prêt.","Il a dit qu’il est prêt.","Il a dit il était prêt.","Il a dit qu’il sera prêt."],
    fill:["Elle a dit qu’elle ______ terminé. (avoir)","avait"],conjugation:["Il a expliqué qu’il ______ malade. (être)","était"],
    transform:["Transformez : Léa a dit : « J’ai perdu mes clés. »","Léa a dit qu’elle avait perdu ses clés."],
    rewrite:["Réécrivez : Il a dit : « Je partirai demain. »","Il a dit qu’il partirait le lendemain."],
    tf:["Au discours indirect au passé, futur simple devient conditionnel présent.","Vrai"],tokens:["Elle","a dit","qu’elle","avait","fini."]
  },
  opinion: {
    formula:"À mon avis / Selon moi / Je pense que + indicatif",
    explanation:"Dùng để nêu ý kiến cá nhân. Sau une opinion affirmative, ta thường dùng indicatif; dạng phủ định có thể kéo theo subjonctif.",
    examples:["Selon moi, le télétravail est efficace.","Je ne pense pas que ce soit une bonne idée."],
    mistakes:["Dùng selon moi que.","Quên que sau je pense / je trouve."],
    q:["Selon moi, cette solution est utile.","Selon moi que cette solution est utile.","Selon je, cette solution est utile.","À mon avis que cette solution est utile."],
    fill:["Je pense ______ cette mesure est nécessaire.","que"],conjugation:["Je ne pense pas qu’il ______ raison. (avoir)","ait"],
    transform:["Exprimez votre opinion : Le sport est essentiel.","À mon avis, le sport est essentiel."],
    rewrite:["Réécrivez avec je trouve que : Cette idée est intéressante.","Je trouve que cette idée est intéressante."],
    tf:["On dit « selon moi que » pour introduire une opinion.","Faux"],tokens:["À mon avis,","cette","solution","est","utile."]
  },
  connectors: {
    formula:"Cause → parce que/car/comme · Conséquence → donc/alors · But → pour/afin de",
    explanation:"Các từ nối giúp tổ chức lập luận. Parce que/car nêu nguyên nhân; donc/c’est pourquoi nêu kết quả; pour/afin de diễn đạt mục đích.",
    examples:["Comme il pleut, je reste chez moi.","Il étudie afin de réussir l’examen."],
    mistakes:["Đặt comme giữa câu thay vì đầu câu.","Dùng pour que với cùng một chủ ngữ thay vì pour + infinitif."],
    q:["Comme il est tard, nous rentrons.","Donc il est tard, parce que nous rentrons.","Il est tard afin de nous rentrons.","Pour il est tard, nous rentrons."],
    fill:["Il révise beaucoup ______ réussir.","pour"],conjugation:["Je parle lentement pour que tu ______. (comprendre)","comprennes"],
    transform:["Reliez avec parce que : Je reste chez moi. Je suis malade.","Je reste chez moi parce que je suis malade."],
    rewrite:["Réécrivez avec donc : Il pleut. Nous annulons la sortie.","Il pleut, donc nous annulons la sortie."],
    tf:["« Afin de » est suivi d’un infinitif.","Vrai"],tokens:["Comme","il pleut,","nous","restons","chez nous."]
  },
  subjonctive: {
    formula:"que + radical de ils au présent + -e, -es, -e, -ions, -iez, -ent",
    explanation:"Subjonctif diễn đạt sự cần thiết, mục đích, cảm xúc, nghi ngờ hoặc nhượng bộ. Il faut que, pour que, bien que và nhiều động từ cảm xúc yêu cầu subjonctif.",
    examples:["Il faut que tu fasses attention.","Bien qu’il soit fatigué, il continue."],
    mistakes:["Dùng indicatif sau il faut que.","Quên dạng bất quy tắc soit, ait, fasse, aille."],
    q:["Il faut que tu fasses attention.","Il faut que tu fais attention.","Il faut tu fasses attention.","Il faut que tu feras attention."],
    fill:["Pour que nous ______ à l’heure. (être)","soyons"],conjugation:["Je suis content que vous ______ venir. (pouvoir)","puissiez"],
    transform:["Transformez avec il faut que : Tu dois partir.","Il faut que tu partes."],
    rewrite:["Réécrivez avec bien que : Il est fatigué, mais il travaille.","Bien qu’il soit fatigué, il travaille."],
    tf:["Après « pour que », on emploie le subjonctif.","Vrai"],tokens:["Il faut","que","tu","fasses","attention."]
  },
  comparison: {
    formula:"plus / moins / aussi + adjectif + que · le/la plus + adjectif",
    explanation:"Comparatif so sánh hai yếu tố; superlatif chỉ mức cao nhất/thấp nhất trong một nhóm. Với danh từ dùng plus de, moins de, autant de.",
    examples:["Léa est plus organisée que Paul.","C’est la ville la plus dynamique de la région."],
    mistakes:["Dùng aussi ... comme thay vì aussi ... que.","Quên mạo từ le/la/les ở superlatif."],
    q:["Elle est aussi sérieuse que sa sœur.","Elle est aussi sérieuse comme sa sœur.","Elle est plus sérieuse de sa sœur.","Elle est la sérieuse que sa sœur."],
    fill:["Cette solution est ______ efficace que l’autre. (=)","aussi"],conjugation:["C’est la ville la plus ______. (dynamique)","dynamique"],
    transform:["Comparez : Paul est organisé. Léa est plus organisée.","Léa est plus organisée que Paul."],
    rewrite:["Réécrivez au superlatif : Aucun hôtel n’est plus cher.","C’est l’hôtel le plus cher."],
    tf:["Le comparatif d’égalité se forme avec aussi... que.","Vrai"],tokens:["Léa","est","plus","organisée","que Paul."]
  },
  relative: {
    formula:"qui = sujet · que = COD · où = lieu/temps · dont = de + nom/verbe",
    explanation:"Đại từ quan hệ nối hai câu và tránh lặp danh từ. Chọn đại từ theo chức năng của danh từ trong mệnh đề phụ.",
    examples:["Le livre que je lis est passionnant.","Voici la ville où je suis né."],
    mistakes:["Nhầm qui (chủ ngữ) với que (tân ngữ).","Dùng que thay dont khi động từ đi với de."],
    q:["C’est le film que j’adore.","C’est le film qui j’adore.","C’est le film dont j’adore.","C’est le film où j’adore."],
    fill:["La personne ______ parle est ma professeure.","qui"],conjugation:["Le projet dont je ______ est important. (parler)","parle"],
    transform:["Reliez : Je visite une ville. Je suis né dans cette ville.","Je visite la ville où je suis né."],
    rewrite:["Reliez avec dont : J’ai besoin de ce livre. Ce livre est rare.","Le livre dont j’ai besoin est rare."],
    tf:["« Dont » remplace un complément introduit par de.","Vrai"],tokens:["Le livre","que","je lis","est","passionnant."]
  },
  passive: {
    formula:"Sujet + être (au temps voulu) + participe passé + par + agent",
    explanation:"Câu bị động nhấn mạnh hành động hoặc đối tượng chịu tác động. Participe passé hòa hợp giống và số với chủ ngữ.",
    examples:["La lettre est écrite par Marie.","Les résultats seront annoncés demain."],
    mistakes:["Quên chia être theo đúng thì.","Không hòa hợp participe passé với chủ ngữ."],
    q:["La décision est prise par le directeur.","La décision a pris par le directeur.","La décision est prendre par le directeur.","La décision prend par le directeur."],
    fill:["Les lettres sont ______ par Paul. (écrire)","écrites"],conjugation:["Le projet ______ annoncé demain. (être, futur)","sera"],
    transform:["Mettez au passif : Le professeur corrige les copies.","Les copies sont corrigées par le professeur."],
    rewrite:["Mettez au passif : On a construit ce pont en 2020.","Ce pont a été construit en 2020."],
    tf:["Au passif, le participe passé s’accorde avec le sujet.","Vrai"],tokens:["La lettre","est","écrite","par","Marie."]
  },
  gerund: {
    formula:"en + participe présent (radical de nous + -ant)",
    explanation:"Gérondif diễn tả hai hành động đồng thời, cách thức hoặc điều kiện, với cùng một chủ ngữ.",
    examples:["Il apprend en pratiquant chaque jour.","Elle écoute de la musique en travaillant."],
    mistakes:["Dùng hai chủ ngữ khác nhau.","Quên en trước participe présent."],
    q:["Il progresse en travaillant régulièrement.","Il progresse en travaille régulièrement.","Il progresse travaillant régulièrement.","Il progresse en travaillé régulièrement."],
    fill:["Elle apprend en ______. (lire)","lisant"],conjugation:["Nous voyageons en ______ le train. (prendre)","prenant"],
    transform:["Transformez : Il écoute un podcast et il cuisine.","Il écoute un podcast en cuisinant."],
    rewrite:["Réécrivez au gérondif : Elle sourit pendant qu’elle parle.","Elle sourit en parlant."],
    tf:["Le gérondif se forme avec en + participe présent.","Vrai"],tokens:["Il","apprend","en","pratiquant","chaque jour."]
  },
  pronouns: {
    formula:"me/te/se/nous/vous + le/la/les + lui/leur + y + en",
    explanation:"Khi có hai đại từ bổ ngữ, thứ tự là cố định trước động từ. Ở impératif affirmatif, thứ tự và hình thức thay đổi.",
    examples:["Je donne le livre à Marie. → Je le lui donne.","Tu parles de ce projet ? → Oui, j’en parle."],
    mistakes:["Đặt lui trước le trong câu thường.","Dùng y để thay người."],
    q:["Je le lui donne.","Je lui le donne.","Je donne le lui.","Je le donne lui."],
    fill:["Ces lettres ? Je ______ envoie demain. (à Paul)","les lui"],conjugation:["Du café ? J’______ veux. (en)","en"],
    transform:["Remplacez : Elle prête sa voiture à ses amis.","Elle la leur prête."],
    rewrite:["Remplacez : Nous parlons de ce problème à Marie.","Nous lui en parlons."],
    tf:["Dans « Je le lui donne », le précède lui.","Vrai"],tokens:["Je","le","lui","donne","demain."]
  },
  condition: {
    formula:"Conditionnel présent = radical du futur + terminaisons de l’imparfait",
    explanation:"Conditionnel diễn đạt mong muốn, lời khuyên, yêu cầu lịch sự hoặc giả định. Conditionnel passé diễn đạt điều đã có thể xảy ra nhưng không xảy ra.",
    examples:["Je voudrais voyager davantage.","Tu aurais dû me prévenir."],
    mistakes:["Nhầm conditionnel -ais với futur -ai.","Quên auxiliaire conditionnel trong conditionnel passé."],
    q:["Je voudrais réserver une chambre.","Je voudrai réserver une chambre.","Je voulais réserver demain.","Je voudrait réserver une chambre."],
    fill:["Nous ______ partir plus tôt. (aimer)","aimerions"],conjugation:["Elle ______ venue si elle avait pu. (être)","serait"],
    transform:["Rendez la demande polie : Je veux un renseignement.","Je voudrais un renseignement."],
    rewrite:["Exprimez un regret : Tu dois me prévenir.","Tu aurais dû me prévenir."],
    tf:["Les terminaisons du conditionnel présent sont celles de l’imparfait.","Vrai"],tokens:["Je","voudrais","réserver","une","chambre."]
  },
  hypothesis: {
    formula:"Si + présent → futur · Si + imparfait → conditionnel présent · Si + PQP → conditionnel passé",
    explanation:"Câu si diễn đạt điều kiện có thật, giả định hiện tại hoặc giả định trái với quá khứ. Không dùng futur hay conditionnel ngay sau si.",
    examples:["Si j’ai le temps, je viendrai.","Si j’avais le temps, je voyagerais."],
    mistakes:["Dùng si j’aurais.","Trộn imparfait với conditionnel passé."],
    q:["Si j’avais le temps, je voyagerais.","Si j’aurais le temps, je voyagerais.","Si j’avais le temps, je voyagerai.","Si j’ai eu le temps, je voyagerais."],
    fill:["Si tu venais, nous ______ contents. (être)","serions"],conjugation:["Si elle avait su, elle ______ venue. (être)","serait"],
    transform:["Complétez : Je n’ai pas le temps, donc je ne voyage pas.","Si j’avais le temps, je voyagerais."],
    rewrite:["Exprimez le regret : Il n’a pas étudié, il a échoué.","S’il avait étudié, il aurait réussi."],
    tf:["On peut dire « si j’aurais ».","Faux"],tokens:["Si","j’avais","le temps,","je","voyagerais."]
  },
  chronology: {
    formula:"d’abord → ensuite/puis → pendant ce temps → enfin",
    explanation:"Các từ nối thời gian giúp kể lại sự việc theo thứ tự rõ ràng và mạch lạc trong bài viết DELF B1.",
    examples:["D’abord, j’ai préparé mon dossier. Ensuite, je l’ai envoyé.","Enfin, j’ai reçu une réponse positive."],
    mistakes:["Lặp ensuite quá nhiều.","Không đặt dấu phẩy sau connecteur ở đầu câu."],
    q:["D’abord, nous préparons le plan ; ensuite, nous écrivons.","Parce que nous préparons le plan, enfin nous écrivons.","Donc d’abord ensuite nous écrivons.","Nous d’abord car écrivons ensuite."],
    fill:["______, nous avons vérifié le document une dernière fois.","Enfin"],conjugation:["Après avoir ______, il est sorti. (finir)","fini"],
    transform:["Ordonnez : envoyer le dossier / le préparer.","D’abord, je prépare le dossier, puis je l’envoie."],
    rewrite:["Reliez avec ensuite : Elle a lu l’annonce. Elle a postulé.","Elle a lu l’annonce, ensuite elle a postulé."],
    tf:["« Enfin » annonce généralement la dernière étape.","Vrai"],tokens:["D’abord,","je prépare","le dossier,","puis","je l’envoie."]
  }
};

function profileFor(title){
  const t=title.toLowerCase();
  if(t.includes("discours indirect au présent")||t.includes("transformation directe"))return ruleProfiles.discoursePresent;
  if(t.includes("discours indirect au passé")||t.includes("présent →")||t.includes("passé composé →")||t.includes("futur simple →")||t.includes("plus-que-parfait"))return ruleProfiles.discoursePast;
  if(t.includes("opinion")||t.includes("je pense")||t.includes("accord"))return ruleProfiles.opinion;
  if(t.includes("cause")||t.includes("conséquence")||t.includes("but :")||t.includes("connecteurs"))return ruleProfiles.connectors;
  if(t.includes("subjonctif")||t.includes("il faut")||t.includes("pour que")||t.includes("bien que")||t.includes("sentiment")||t.includes("indicatif"))return ruleProfiles.subjonctive;
  if(t.includes("comparatif")||t.includes("superlatif")||t.includes("ne... que")||t.includes("adverbes")||t.includes("sans +"))return ruleProfiles.comparison;
  if(t.includes("pronoms relatifs"))return ruleProfiles.relative;
  if(t.includes("passif")||t.includes("voix passive"))return ruleProfiles.passive;
  if(t.includes("gérondif"))return ruleProfiles.gerund;
  if(t.includes("double pronoms"))return ruleProfiles.pronouns;
  if(t.includes("conditionnel"))return ruleProfiles.condition;
  if(t.includes("hypothèse"))return ruleProfiles.hypothesis;
  if(t.includes("chronologiques"))return ruleProfiles.chronology;
  return ruleProfiles.connectors;
}

function localDate(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`}
const grammarData=[];
let dateCursor=new Date("2026-06-19T00:00:00");
weeklyTopics.forEach((topics,week)=>topics.forEach((title,day)=>{
  const rule=profileFor(title);
  const date=localDate(dateCursor);
  grammarData.push({date,week:week+1,title,formula:rule.formula,explanation:rule.explanation,examples:[...rule.examples],mistakes:[...rule.mistakes],exercises:generateExercises(rule,date,title.includes("Révision")||title.includes("Mini test"))});
  dateCursor.setDate(dateCursor.getDate()+1);
}));

function generateExercises(rule,date,isReview){
  const options=[...rule.q].sort(()=>Math.random()-.5);
  const list=[
    {type:"qcm",question:"Choisissez la phrase correcte.",options,answer:rule.q[0],explanation:`Cấu trúc đúng: ${rule.formula}.`},
    {type:"fill",question:rule.fill[0],answer:rule.fill[1],explanation:`Điền “${rule.fill[1]}” theo công thức của bài.`},
    {type:"conjugation",question:rule.conjugation[0],answer:rule.conjugation[1],explanation:`Dạng chia đúng là “${rule.conjugation[1]}”.`},
    {type:"transformation",question:rule.transform[0],answer:rule.transform[1],explanation:`Câu biến đổi mẫu: ${rule.transform[1]}`},
    {type:"rewrite",question:rule.rewrite[0],answer:rule.rewrite[1],explanation:`Cách viết lại tự nhiên: ${rule.rewrite[1]}`},
    {type:"truefalse",question:rule.tf[0],options:["Vrai","Faux"],answer:rule.tf[1],explanation:`Mệnh đề này ${rule.tf[1]==="Vrai"?"đúng":"sai"} theo quy tắc trên.`},
    {type:"reorder",question:"Remettez les mots dans l’ordre.",tokens:[...rule.tokens].sort(()=>Math.random()-.5),answer:rule.tokens.join(" "),explanation:`Thứ tự đúng: ${rule.tokens.join(" ")}`}
  ];
  return (isReview?list:list.slice(0,6)).map((x,i)=>({...x,id:`${date}-${i}`}));
}

const emptyState={attempts:{},notes:{},errors:{},customLessons:{},formulaImages:{}};
let state=loadState(),activeDate=grammarData.some(x=>x.date===localDate(new Date()))?localDate(new Date()):grammarData[0].date;
let visibleExercises=[],submitted=false,reviewMode=false;
const $=s=>document.querySelector(s);

document.addEventListener("DOMContentLoaded",()=>{bind();renderGrammarDocsMenu();renderNav();renderLesson();updateDashboard()});
function bind(){
  $("#menuButton").onclick=()=>toggleSidebar(true);$("#sidebarClose").onclick=()=>toggleSidebar(false);$("#overlay").onclick=()=>toggleSidebar(false);
  $("#grammarDocsButton").onclick=event=>{event.stopPropagation();toggleGrammarDocsMenu()};
  $("#grammarDocsDropdown").onclick=event=>event.stopPropagation();
  document.addEventListener("click",()=>toggleGrammarDocsMenu(false));document.addEventListener("keydown",event=>{if(event.key==="Escape")toggleGrammarDocsMenu(false)});
  $("#examMode").onchange=()=>{renderExercises();$("#examNotice").classList.toggle("hidden",!$("#examMode").checked)};
  $("#submitButton").onclick=submitExercises;$("#reviewErrors").onclick=startErrorReview;$("#resetDay").onclick=resetDay;
  $("#notes").oninput=debounce(saveNotes,350);
  document.querySelectorAll(".choose-image").forEach(button=>button.onclick=()=>document.querySelector(`.formula-image-input[data-slot="${button.dataset.slot}"]`).click());
  document.querySelectorAll(".formula-image-input").forEach(input=>input.onchange=event=>handleFormulaImageFile(event.target.files[0],Number(input.dataset.slot)));
  document.querySelectorAll(".paste-image").forEach(button=>button.onclick=()=>pasteFormulaImageFromClipboard(Number(button.dataset.slot)));
  document.querySelectorAll(".a4-frame").forEach(frame=>frame.onpaste=event=>handleFormulaImagePaste(event,Number(frame.dataset.slot)));
  document.querySelectorAll(".remove-image").forEach(button=>button.onclick=()=>removeFormulaImage(Number(button.dataset.slot)));
}
function renderGrammarDocsMenu(){
  let index=0;
  $("#grammarDocsLinks").innerHTML=weeklyTopics.map((topics,weekIndex)=>`<section><div class="grammar-docs-week">TUẦN ${weekIndex+1}</div>${topics.map(topic=>{const item=grammarData[index],href=GOOGLE_DOC_URL+GOOGLE_DOC_TOPIC_LINKS[index],current=item.date===activeDate;index++;return`<a class="grammar-docs-link ${current?"current":""}" href="${href}" target="_blank" rel="noopener"><time>${shortDate(item.date)}</time><span>${escapeHtml(topic)}</span><i>↗</i></a>`}).join("")}</section>`).join("");
}
function toggleGrammarDocsMenu(force){const dropdown=$("#grammarDocsDropdown"),button=$("#grammarDocsButton"),open=typeof force==="boolean"?force:dropdown.classList.contains("hidden");dropdown.classList.toggle("hidden",!open);button.setAttribute("aria-expanded",String(open))}
function lesson(){return grammarData.find(x=>x.date===activeDate)}
function renderNav(){
  $("#dateNav").innerHTML="";
  for(let w=1;w<=6;w++){
    const title=document.createElement("div");title.className="week-title";title.textContent=`TUẦN ${w}`;$("#dateNav").appendChild(title);
    grammarData.filter(x=>x.week===w).forEach(item=>{const b=document.createElement("button");b.className=`date-btn ${item.date===activeDate?"active":""}`;b.innerHTML=`<strong>${shortDate(item.date)}</strong><span>${escapeHtml(item.title)}</span><i>${isComplete(item.date)?"●":"○"}</i>`;b.onclick=()=>selectDate(item.date);$("#dateNav").appendChild(b)})
  }
}
function selectDate(date){activeDate=date;reviewMode=false;submitted=false;renderGrammarDocsMenu();renderNav();renderLesson();toggleSidebar(false);scrollTo({top:0,behavior:"smooth"})}
function renderLesson(){
  const l=lesson();
  $("#weekBadge").textContent=`Tuần ${l.week}`;$("#lessonDate").textContent=longDate(l.date);$("#lessonTitle").textContent=l.title;$("#lessonUse").textContent="Học công thức bằng hai trang ảnh A4 bên dưới.";
  renderFormulaImage();$("#notes").value=state.notes[activeDate]||"";$("#resultBox").classList.add("hidden");renderExercises();
}
function renderExercises(){
  submitted=false;const source=lesson().exercises;visibleExercises=reviewMode?source.filter(x=>state.errors[x.id]):source;$("#exerciseCount").textContent=`${visibleExercises.length} câu`;
  if(!visibleExercises.length){$("#exerciseForm").innerHTML='<p class="feedback">Không còn lỗi trong ngày này. Très bien !</p>';return}
  $("#exerciseForm").innerHTML=visibleExercises.map((e,i)=>exerciseHtml(e,i)).join("");
  $("#exerciseForm").querySelectorAll('input[type="radio"]').forEach(x=>x.onchange=()=>instantRadio(x));
  $("#exerciseForm").querySelectorAll(".text-answer").forEach(x=>x.onblur=()=>instantText(x));
  setupReorder();
}
function exerciseHtml(e,i){
  let control="";
  if(["qcm","truefalse"].includes(e.type))control=`<div class="options">${e.options.map(o=>`<label class="option"><input type="radio" name="q${i}" value="${attr(o)}">${escapeHtml(o)}</label>`).join("")}</div>`;
  else if(e.type==="reorder")control=`<div class="reorder-bank" data-index="${i}">${e.tokens.map(t=>`<button class="token" draggable="true" type="button">${escapeHtml(t)}</button>`).join("")}</div><div class="reorder-zone" data-index="${i}" aria-label="Thả từ vào đây"></div>`;
  else control=`<input class="text-answer" data-index="${i}" autocomplete="off" placeholder="Nhập câu trả lời...">`;
  return `<article class="exercise" data-index="${i}"><span class="type">${typeName(e.type)}</span><h4>${i+1}. ${escapeHtml(e.question)}</h4>${control}<p class="feedback hidden"></p></article>`;
}
function instantRadio(input){if($("#examMode").checked||submitted)return;const i=Number(input.closest(".exercise").dataset.index),e=visibleExercises[i],card=input.closest(".exercise");card.querySelectorAll(".option").forEach(x=>x.classList.remove("correct","wrong"));input.closest(".option").classList.add(input.value===e.answer?"correct":"wrong");showFeedback(card,input.value===e.answer,e)}
function instantText(input){if($("#examMode").checked||submitted||!input.value.trim())return;const i=Number(input.dataset.index),e=visibleExercises[i];showFeedback(input.closest(".exercise"),isCorrect(input.value,e.answer),e)}
function showFeedback(card,ok,e){const p=card.querySelector(".feedback");p.textContent=`${ok?"Chính xác!":"Chưa đúng."} ${e.explanation}`;p.classList.remove("hidden")}
function setupReorder(){
  document.querySelectorAll(".token").forEach(token=>{token.onclick=()=>{const bank=token.parentElement,zone=bank.classList.contains("reorder-zone")?bank:bank.nextElementSibling;(bank.classList.contains("reorder-zone")?bank.previousElementSibling:zone).appendChild(token);if(!$("#examMode").checked)checkReorder(zone)};token.ondragstart=e=>e.dataTransfer.setData("text/plain",token.textContent)});
  document.querySelectorAll(".reorder-zone,.reorder-bank").forEach(zone=>{zone.ondragover=e=>e.preventDefault();zone.ondrop=e=>{e.preventDefault();const text=e.dataTransfer.getData("text/plain"),token=[...document.querySelectorAll(".token")].find(x=>x.textContent===text);if(token)zone.appendChild(token);if(zone.classList.contains("reorder-zone")&&!$("#examMode").checked)checkReorder(zone)}})
}
function checkReorder(zone){const i=Number(zone.dataset.index),e=visibleExercises[i];if(zone.children.length===e.tokens.length)showFeedback(zone.closest(".exercise"),isCorrect([...zone.children].map(x=>x.textContent).join(" "),e.answer),e)}
function answerFor(i,e){const card=$(`.exercise[data-index="${i}"]`);if(["qcm","truefalse"].includes(e.type))return card.querySelector("input:checked")?.value||"";if(e.type==="reorder")return [...card.querySelector(".reorder-zone").children].map(x=>x.textContent).join(" ");return card.querySelector(".text-answer").value}
function submitExercises(){
  if(!visibleExercises.length)return;let correct=0;const wrong=[];visibleExercises.forEach((e,i)=>{const value=answerFor(i,e),ok=isCorrect(value,e.answer);if(ok){correct++;delete state.errors[e.id]}else{wrong.push(e.id);state.errors[e.id]=(state.errors[e.id]||0)+1}const card=$(`.exercise[data-index="${i}"]`);showFeedback(card,ok,e);card.querySelectorAll("input,.text-answer,.token").forEach(x=>x.disabled=true);if(["qcm","truefalse"].includes(e.type))card.querySelectorAll(".option").forEach(x=>{if(x.querySelector("input").value===e.answer)x.classList.add("correct")})});
  const score=Math.round(correct/visibleExercises.length*100);state.attempts[activeDate]||=[];state.attempts[activeDate].push({score,correct,total:visibleExercises.length,wrong,timestamp:new Date().toISOString()});saveState();submitted=true;
  $("#resultBox").innerHTML=`<strong>${score}/100</strong><p>${correct}/${visibleExercises.length} câu đúng · ${wrong.length} lỗi cần ôn</p>`;$("#resultBox").classList.remove("hidden");renderNav();updateDashboard();$("#resultBox").scrollIntoView({behavior:"smooth",block:"center"})
}
function startErrorReview(){const count=lesson().exercises.filter(x=>state.errors[x.id]).length;if(!count)return toast("Ngày này chưa có lỗi cần ôn.");reviewMode=true;$("#resultBox").classList.add("hidden");renderExercises();toast(`Đang ôn lại ${count} câu từng làm sai.`)}
function resetDay(){if(!confirm(`Xóa điểm, lỗi và ghi chú ngày ${shortDate(activeDate)}?`))return;delete state.attempts[activeDate];delete state.notes[activeDate];lesson().exercises.forEach(x=>delete state.errors[x.id]);saveState();reviewMode=false;renderLesson();renderNav();updateDashboard();toast("Đã đặt lại ngày học.")}
function saveNotes(){state.notes[activeDate]=$("#notes").value;saveState();$("#noteStatus").textContent="Đã lưu ✓";setTimeout(()=>$("#noteStatus").textContent="Tự động lưu",1000)}

function renderFormulaImage(){
  const saved=state.formulaImages[activeDate],sources=Array.isArray(saved)?saved:[saved||"",""];
  document.querySelectorAll(".a4-slot").forEach((slot,index)=>{const source=sources[index]||"",preview=slot.querySelector(".formula-image-preview"),placeholder=slot.querySelector(".a4-placeholder"),remove=slot.querySelector(".remove-image");preview.classList.toggle("hidden",!source);placeholder.classList.toggle("hidden",Boolean(source));remove.classList.toggle("hidden",!source);if(source)preview.src=source;else preview.removeAttribute("src")})
}
async function handleFormulaImageFile(file,slot=0){
  if(!file)return;if(!file.type.startsWith("image/"))return toast("Tệp đã chọn không phải là ảnh.");
  try{const dataUrl=await convertImageToA4(file);storeFormulaImage(dataUrl,slot)}catch{toast("Không thể xử lý ảnh này. Hãy thử ảnh PNG, JPG hoặc WebP.")}
  const input=document.querySelector(`.formula-image-input[data-slot="${slot}"]`);if(input)input.value=""
}
function handleFormulaImagePaste(event,slot=0){
  const item=[...(event.clipboardData?.items||[])].find(entry=>entry.type.startsWith("image/"));
  if(!item)return toast("Clipboard chưa có ảnh. Hãy sao chép ảnh rồi thử lại.");event.preventDefault();handleFormulaImageFile(item.getAsFile(),slot)
}
async function pasteFormulaImageFromClipboard(slot=0){
  const frame=document.querySelector(`.a4-frame[data-slot="${slot}"]`);
  if(!navigator.clipboard?.read){frame.focus();return toast("Nhấp vào khung A4 rồi nhấn Ctrl + V để dán ảnh.")}
  try{
    const items=await navigator.clipboard.read();
    for(const item of items){const type=item.types.find(value=>value.startsWith("image/"));if(type){return handleFormulaImageFile(await item.getType(type),slot)}}
    toast("Clipboard chưa có ảnh.")
  }catch{frame.focus();toast("Trình duyệt chưa cấp quyền. Hãy nhấn Ctrl + V trong khung A4.")}
}
function convertImageToA4(file){
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const image=new Image();image.onerror=reject;image.onload=()=>{
    const canvas=document.createElement("canvas"),width=1200,height=1697;canvas.width=width;canvas.height=height;const context=canvas.getContext("2d");context.fillStyle="#ffffff";context.fillRect(0,0,width,height);
    const margin=44,maxWidth=width-margin*2,maxHeight=height-margin*2,scale=Math.min(maxWidth/image.width,maxHeight/image.height),drawWidth=image.width*scale,drawHeight=image.height*scale;
    context.drawImage(image,(width-drawWidth)/2,(height-drawHeight)/2,drawWidth,drawHeight);resolve(canvas.toDataURL("image/jpeg",.88))
  };image.src=reader.result};reader.readAsDataURL(file)})
}
function storeFormulaImage(dataUrl,slot=0){
  const previous=state.formulaImages[activeDate],sources=Array.isArray(previous)?[...previous]:[previous||"",""];sources[slot]=dataUrl;state.formulaImages[activeDate]=sources;
  try{saveState();renderFormulaImage();toast(`Đã lưu ảnh công thức Trang ${slot===0?"A":"B"}.`)}catch{if(previous)state.formulaImages[activeDate]=previous;else delete state.formulaImages[activeDate];toast("Ảnh quá lớn để lưu. Hãy chọn ảnh có dung lượng nhỏ hơn.")}
}
function removeFormulaImage(slot=0){if(!confirm(`Xóa ảnh công thức Trang ${slot===0?"A":"B"}?`))return;const saved=state.formulaImages[activeDate],sources=Array.isArray(saved)?[...saved]:[saved||"",""];sources[slot]="";if(!sources.some(Boolean))delete state.formulaImages[activeDate];else state.formulaImages[activeDate]=sources;saveState();renderFormulaImage();toast("Đã xóa ảnh công thức.")}

function openContentEditor(){
  const l=lesson(),custom=state.customLessons[activeDate];
  $("#lessonContentInput").value=custom?.raw||[
    `Định nghĩa:\nChủ điểm ngữ pháp “${l.title}” trong chương trình DELF B1.`,
    `Công thức:\n${l.formula}`,
    `Cách dùng:\n${l.explanation}`,
    `Cách chia / Formation:\n${l.formula}`,
    `Ví dụ:\n${l.examples.join("\n")}`,
    `Lỗi thường gặp:\n${l.mistakes.join("\n")}`
  ].join("\n\n");
  $("#contentEditorModal").classList.remove("hidden");document.body.classList.add("modal-open");setTimeout(()=>$("#lessonContentInput").focus(),50)
}
function closeContentEditor(){$("#contentEditorModal").classList.add("hidden");document.body.classList.remove("modal-open")}
function organizeAndSaveContent(){
  const raw=$("#lessonContentInput").value.trim();if(!raw)return toast("Hãy dán nội dung trước khi sắp xếp.");
  const organized=smartOrganizeText(raw);state.customLessons[activeDate]={...organized,raw};saveState();renderLesson();closeContentEditor();toast("Đã sắp xếp và lưu đầy đủ nội dung bài học.")
}
function restoreDefaultContent(){
  delete state.customLessons[activeDate];saveState();renderLesson();closeContentEditor();toast("Đã khôi phục nội dung mặc định của ngày này.")
}
function smartOrganizeText(raw){
  const sections={definition:[],formula:[],usage:[],conjugation:[],examples:[],mistakes:[],extra:[]};
  let current="",recognized=0;
  const headingRules=[
    ["definition",/^(định nghĩa|khái niệm|définition)\s*:?\s*(.*)$/i],
    ["conjugation",/^(cách chia(?:\s*\/\s*formation)?|chia động từ|formation|conjugaison)\s*:?\s*(.*)$/i],
    ["formula",/^(công thức(?:\s*\/\s*cách chia)?|cấu trúc|formule|structure)\s*:?\s*(.*)$/i],
    ["usage",/^(cách dùng|cách sử dụng|emploi|utilisation|usage)\s*:?\s*(.*)$/i],
    ["examples",/^(ví dụ|exemples?)\s*:?\s*(.*)$/i],
    ["mistakes",/^(lỗi thường gặp|lỗi|chú ý|erreurs?|attention)\s*:?\s*(.*)$/i]
  ];
  raw.replace(/\r/g,"").split("\n").forEach(line=>{
    const trimmed=line.trim();let heading=null;
    for(const [key,regex] of headingRules){const match=trimmed.match(regex);if(match){heading={key,text:match[2]||""};break}}
    if(heading){current=heading.key;recognized++;if(heading.text)sections[current].push(heading.text);return}
    if(!trimmed){if(current&&sections[current].at(-1)!=="")sections[current].push("");return}
    (current?sections[current]:sections.extra).push(line.trim())
  });

  // Không có tiêu đề: phân loại từng đoạn bằng dấu hiệu ngữ pháp, không làm mất phần nào.
  if(!recognized){
    Object.keys(sections).forEach(k=>sections[k]=[]);
    const paragraphs=raw.replace(/\r/g,"").split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
    paragraphs.forEach((paragraph,index)=>{
      const lower=paragraph.toLowerCase();
      if(/exemple|ví dụ|«|»|→|\bex\s*:/.test(lower))sections.examples.push(paragraph);
      else if(/erreur|lỗi|attention|chú ý|không được|quên/.test(lower))sections.mistakes.push(paragraph);
      else if(/conjug|formation|terminaison|radical|cách chia|chia động từ/.test(lower))sections.conjugation.push(paragraph);
      else if(/[+=]|structure|công thức|cấu trúc/.test(lower))sections.formula.push(paragraph);
      else if(index===0)sections.definition.push(paragraph);
      else if(!sections.usage.length)sections.usage.push(paragraph);
      else sections.extra.push(paragraph)
    })
  }
  const clean=value=>value.join("\n").replace(/\n{3,}/g,"\n\n").trim();
  const items=value=>clean(value).split(/\n+/).map(x=>x.replace(/^[•\-*\d.)]+\s*/,"").trim()).filter(Boolean);
  return{
    definition:clean(sections.definition),formula:clean(sections.formula),usage:clean(sections.usage),conjugation:clean(sections.conjugation),
    examples:items(sections.examples),mistakes:items(sections.mistakes),extra:clean(sections.extra)
  }
}

function updateDashboard(){const attempts=Object.values(state.attempts).flat(),completed=grammarData.filter(x=>isComplete(x.date)).length,avg=attempts.length?Math.round(attempts.reduce((s,x)=>s+x.score,0)/attempts.length):null,errors=Object.keys(state.errors).length;$("#totalLessons").textContent=grammarData.length;$("#completedLessons").textContent=completed;$("#averageScore").textContent=avg??"—";$("#errorCount").textContent=errors;$("#progressLabel").textContent=`${completed}/${grammarData.length}`;$("#progressBar").style.width=`${completed/grammarData.length*100}%`;const w=lesson().week,weekDays=grammarData.filter(x=>x.week===w),done=weekDays.filter(x=>isComplete(x.date)).length;$("#weeklyProgress").textContent=`Tuần ${w}: ${done}/${weekDays.length}`}
function isComplete(date){return(state.attempts[date]||[]).some(x=>x.score>=60)}
function isCorrect(a,b){return normalize(a)===normalize(b)}function normalize(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g,"'").replace(/[.,!?;:«»]/g,"").replace(/\s+/g," ").trim()}
function typeName(t){return({qcm:"QCM",fill:"ĐIỀN TỪ",conjugation:"CHIA ĐỘNG TỪ",transformation:"BIẾN ĐỔI CÂU",rewrite:"VIẾT LẠI CÂU",truefalse:"VRAI / FAUX",reorder:"KÉO · THẢ"})[t]}
function shortDate(d){const[y,m,x]=d.split("-");return`${x}/${m}`}function longDate(d){return new Intl.DateTimeFormat("vi-VN",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(d+"T00:00:00"))}
function toggleSidebar(open){$("#sidebar").classList.toggle("open",open);$("#overlay").classList.toggle("show",open)}function toast(m){$("#toast").textContent=m;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),2400)}
function loadState(){try{return{...structuredClone(emptyState),...JSON.parse(localStorage.getItem(STORAGE_KEY))}}catch{return structuredClone(emptyState)}}function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c])}function attr(s=""){return escapeHtml(s)}
