# -*- coding: utf-8 -*-
"""Captures du mode d'emploi FR + NL — données FICTIVES enrichies (aucun cadre vide)."""
import os, sys
from playwright.sync_api import sync_playwright

LANG = sys.argv[1] if len(sys.argv) > 1 else 'fr'
OUT = 'pwa/manual' + ('/nl' if LANG == 'nl' else '')
os.makedirs(OUT, exist_ok=True)
URL = 'http://localhost:8766/index.html'

def shot(pg, sel, name):
    el = pg.locator(sel).first
    el.scroll_into_view_if_needed()
    pg.wait_for_timeout(250)
    el.screenshot(path=f'{OUT}/{name}.png')
    print('SHOT', name)

SEED = '''async (L) => {
  const F = L==='fr';
  // D1 : Karim (en cours, riche)
  openFicheImport(); fillAzizi(); FICHE_PHOTO=''; saveFiche({preventDefault(){}});
  try{closeModal('anaModal')}catch(e){} try{closeModal('detailModal')}catch(e){}
  let arr=loadDossiers(); const d=arr[0]; initGestion(d);
  d.statut='cours';
  d.banque.operations=[
    {date:'2026-05-02',lib:F?'Argent de poche Fedasil':'Zakgeld Fedasil',mt:25},
    {date:'2026-05-15',lib:F?'Achat matériel scolaire':'Schoolmateriaal',mt:-12.50},
    {date:'2026-06-01',lib:F?'Argent de poche Fedasil':'Zakgeld Fedasil',mt:25}];
  d.frais=[{date:'2026-05-20',motif:F?'Audition CGRA':'CGVS-gehoor',de:F?'Namur':'Namen',a:F?'Bruxelles':'Brussel',km:130,pkm:0.428,park:8,autres:0},
           {date:'2026-06-03',motif:F?'Visite du centre':'Bezoek centrum',de:F?'Namur':'Namen',a:'Jodoigne',km:74,pkm:0.428,park:0,autres:0}];
  d.jugePaix={cp:'1000',canton:F?'Justice de paix de Bruxelles (1er canton)':'Vredegerecht Brussel (1e kanton)',adresse:F?'Rue de la Régence 4, 1000 Bruxelles':'Regentschapsstraat 4, 1000 Brussel',tel:'02 519 81 11',email:''};
  ANA={txt:"bijlage 26 ; inscription scolaire en DASPA confirmée ; schoolinschrijving"};
  analyzeDocText(ANA.txt).forEach(x=>{x.D.apply(d,x.m);(d.journal=d.journal||[]).unshift({date:nowISO(),source:F?'Fiche DVZ':'DVZ-fiche',label:x.D.label});});
  // D2 : Fatou (nouveau dossier actif -> la matrice montre 2 jeunes)
  const id2='D'+(Date.now()+7);
  const d2={id:id2,nom:'DEMO, Fatou',age:'16',pays:'Guinée',statut:'nouveau',langue:'Peul',
    notes:F?'Arrivée récente. Première rencontre très positive.':'Recent aangekomen. Eerste ontmoeting zeer positief.',
    arrivee:addDays(nowISO(),-12),photo:'',fiche:{ov:'0000001 (exemple)',nom:'DEMO, Fatou',naissance:'02.03.2010 (≈ 16)',sexe:{fr:'Féminin',nl:'Vrouwelijk'},nationalite:'Guinée',langueParlee:'Peul',adresseBE:'/',adresseOrigine:'(exemple)',motif:{fr:'Exemple fictif de démonstration.',nl:'Fictief demonstratievoorbeeld.'}},
    jugePaix:{cp:'',canton:'',adresse:'',tel:'',email:''},
    rapports:initRapports(addDays(nowISO(),-12)),banque:{operations:[]},frais:[],
    rdv:genRdvDefaults(addDays(nowISO(),-12)),
    checklist:STD_CHECKLIST.map(t=>({t,done:false})),cree:addDays(nowISO(),-12)};
  d2.checklist[0].done=true;
  arr.push(d2);
  saveDossiers(arr);
  // D3 : Ali (clôturé -> archives non vides)
  const id3='D'+(Date.now()+13);
  const d3={id:id3,nom:'DEMO, Ali',age:'18',pays:'Afghanistan',statut:'clos',langue:'Dari',notes:F?'Tutelle clôturée à la majorité. Carte A obtenue, en formation.':'Voogdij afgesloten bij meerderjarigheid. A-kaart verkregen, in opleiding.',arrivee:'2024-03-01',photo:'',
    fiche:{ov:'0000002 (exemple)',nom:'DEMO, Ali',naissance:'01.05.2008',sexe:{fr:'Masculin',nl:'Mannelijk'},nationalite:'Afghanistan',langueParlee:'Dari'},
    jugePaix:{cp:'4000',canton:F?'Justice de paix de Liège':'Vredegerecht Luik',adresse:'',tel:'',email:''},
    rapports:initRapports('2024-03-01').map(r=>({...r,fait:true,dateFait:'2025-12-01'})),
    banque:{operations:[{date:'2026-01-10',lib:F?'Solde remis au jeune':'Saldo overhandigd',mt:0}]},frais:[],rdv:[],
    checklist:STD_CHECKLIST.map(t=>({t,done:true})),cree:'2024-03-01',archiveLe:nowISO()};
  await loadArchEnsure(); ARCHIVES.push(d3); await persistArch();
  // PJ chiffrée pour D1 (fausse annexe 26)
  const bytes=new TextEncoder().encode('%PDF-1.4 demo annexe 26 — document fictif de démonstration');
  const {iv,ct}=await aesEncryptBytes(CRYPTO_KEY,bytes.buffer);
  const db=await idbOpen();
  await new Promise(res=>{const tx=db.transaction('pj','readwrite');
    tx.objectStore('pj').put({id:'PDEMO1',dossier:d.id,name:F?'annexe26_Karim.pdf':'bijlage26_Karim.pdf',type:'application/pdf',size:bytes.length,date:nowISO(),iv,ct});
    tx.objectStore('pj').put({id:'PDEMO2',dossier:d.id,name:F?'attestation_scolaire.pdf':'schoolattest.pdf',type:'application/pdf',size:bytes.length,date:nowISO(),iv,ct});
    tx.oncomplete=res;});
  renderDashboard(); renderDossiers(); updateArchBtn();
  return d.id;
}'''

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 1280, 'height': 900}, device_scale_factor=1.5, locale=LANG+'-BE')
    pg = ctx.new_page()
    pg.goto(URL)
    pg.wait_for_timeout(800)
    if LANG == 'nl':
        pg.evaluate("setLang('nl')")
        pg.wait_for_timeout(300)

    shot(pg, '.auth-box', '01-mot-de-passe')
    pg.evaluate("async () => { await setupAccount('Demo!2026'); onUnlocked(); }")
    pg.wait_for_timeout(600)
    if pg.locator('#tourModal.open').count():
        shot(pg, '#tourModal .modal-box', '02-bienvenue')
        pg.evaluate("localStorage.setItem('mena_tour_done','1');closeModal('tourModal')")

    d1 = pg.evaluate(SEED, LANG)
    pg.wait_for_timeout(500)

    pg.evaluate("go('dashboard');window.scrollTo(0,0)")
    pg.wait_for_timeout(400)
    pg.screenshot(path=f'{OUT}/03-tableau-de-bord.png'); print('SHOT 03')

    pg.evaluate(f"() => {{ document.getElementById('dashDossier').value='{d1}'; renderDashboard(); }}")
    pg.wait_for_timeout(300)
    shot(pg, '#dashDeadlines >> xpath=ancestor::div[contains(@class,\"card\")]', '04-echeances-selection')
    shot(pg, '#dashMatrixCard', '05-suivi-par-dossier')

    pg.evaluate("go('dossiers')"); pg.wait_for_timeout(300)
    shot(pg, '#dossiers', '06-mes-dossiers')

    pg.evaluate("openFicheImport(); fillAzizi()"); pg.wait_for_timeout(300)
    shot(pg, '#ficheModal .modal-box', '07-import-fiche')
    pg.evaluate("closeModal('ficheModal')")

    DOC = ("Le Commissariat général notifie une décision de refus. L'intéressé réside désormais à l'adresse : Rue de la Gare 7, 6000 Charleroi."
           if LANG == 'fr' else
           "Het Commissariaat-generaal betekent een weigeringsbeslissing. De betrokkene verblijft voortaan op het adres: Stationsstraat 7, 6000 Charleroi.")
    pg.evaluate(f'''() => {{ openAnalyse('{d1}', {DOC!r}, '{ 'Décision reçue' if LANG=='fr' else 'Ontvangen beslissing' }'); }}''')
    pg.wait_for_timeout(300)
    shot(pg, '#anaModal .modal-box', '08-analyse-document')
    pg.evaluate("closeModal('anaModal')")

    pg.evaluate(f"openDossierDetail('{d1}')")
    pg.wait_for_timeout(600)
    shot(pg, '#detailModal .modal-box', '09-dossier-detail')

    def open_acc(txt, name):
        pg.evaluate(f'''() => {{
          document.querySelectorAll('#detailContent details').forEach(x=>x.open=false);
          const det=[...document.querySelectorAll('#detailContent details')].find(x=>x.querySelector('summary').textContent.includes("{txt}"));
          if(det){{det.open=true;det.scrollIntoView();}}
        }}''')
        pg.wait_for_timeout(350)
        pg.locator('#detailContent details[open]').first.screenshot(path=f'{OUT}/{name}.png')
        print('SHOT', name)

    open_acc('DVZ', '10-fiche-dvz')
    open_acc('Justice de paix' if LANG == 'fr' else 'Vrederechter', '11-juge-rapports')
    open_acc('Agenda', '12-agenda')
    open_acc('bancaire' if LANG == 'fr' else 'Bankbeheer', '13-banque')
    open_acc('Frais' if LANG == 'fr' else 'Kosten', '14-frais')
    open_acc('Documents du dossier' if LANG == 'fr' else 'Documenten van het dossier', '15-pieces-jointes')
    open_acc('Conseils actifs' if LANG == 'fr' else 'adviezen', '16-conseils-actifs')
    pg.evaluate("closeModal('detailModal')")

    TR = ("Behoefte aan opvang : JA. De jongere is ingeschreven in de school.")
    pg.evaluate(f"() => {{ openTrad({TR!r}); doTrad(); }}")
    pg.wait_for_timeout(300)
    shot(pg, '#trModal .modal-box', '17-traduction')
    pg.evaluate("closeModal('trModal')")

    pg.evaluate("go('guide')"); pg.wait_for_timeout(900)
    pg.evaluate("const x=document.querySelector('#guideContent details');if(x){x.open=true};window.scrollTo(0,0)")
    pg.wait_for_timeout(300)
    pg.screenshot(path=f'{OUT}/18-guide.png'); print('SHOT 18')

    pg.evaluate("openGlossaire()"); pg.wait_for_timeout(300)
    shot(pg, '#glossModal .modal-box', '19-glossaire')
    pg.evaluate("closeModal('glossModal')")

    pg.evaluate("openBackup()"); pg.wait_for_timeout(300)
    shot(pg, '#backupModal .modal-box', '20-sauvegarde')
    pg.evaluate("closeModal('backupModal')")

    pg.evaluate("openArchives()"); pg.wait_for_timeout(500)
    shot(pg, '#archModal .modal-box', '21-archives')
    pg.evaluate("closeModal('archModal')")

    # 22 — alerte juridique (bandeau, vue dashboard)
    pg.evaluate("go('dashboard');localStorage.removeItem('mena_alert_seen');checkLegalAlert()")
    pg.wait_for_timeout(900)
    if pg.locator('#legalAlert .banner').count():
        shot(pg, '#legalAlert', '22-alerte')

    # 23 — calculateur de délais (rempli : reconnaissance le 10/01/2026)
    pg.evaluate(f"openCalcDelais('{d1}')")
    pg.wait_for_timeout(300)
    pg.evaluate("document.getElementById('cd_ev').value='reco';document.getElementById('cd_date').value='2026-01-10';")
    pg.evaluate(f"renderCalc('{d1}')")
    pg.wait_for_timeout(300)
    shot(pg, '#calcModal .modal-box', '23-calculateur')
    pg.evaluate("closeModal('calcModal')")

    # 24 — préparation CGRA (réponses fictives)
    pg.evaluate(f"openCgraPrep('{d1}')")
    pg.wait_for_timeout(300)
    if LANG == 'fr':
        A0="Karim D., né le 01.01.2010 dans la province de Baghlan (district fictif). Père agriculteur, mère au foyer, deux sœurs plus jeunes restées au pays avec la mère."
        A1="Départ en mars 2025 : le père a été menacé après avoir refusé de collaborer avec un groupe armé local. Karim, visé comme « fils aîné », a quitté le village avec un passeur payé par un oncle."
        A2="Crainte d'être enrôlé de force et de représailles contre la famille. Les menaces ont continué après son départ (messages reçus par l'oncle)."
    else:
        A0="Karim D., geboren 01.01.2010 in de provincie Baghlan (fictief district). Vader landbouwer, moeder huisvrouw, twee jongere zussen bij de moeder gebleven."
        A1="Vertrek in maart 2025: de vader werd bedreigd nadat hij weigerde mee te werken met een lokale gewapende groep. Karim, geviseerd als « oudste zoon », verliet het dorp met een smokkelaar betaald door een oom."
        A2="Vrees voor gedwongen rekrutering en represailles tegen de familie. De bedreigingen gingen door na zijn vertrek (berichten ontvangen door de oom)."
    pg.evaluate(f"document.getElementById('cg_0').value={A0!r};document.getElementById('cg_1').value={A1!r};document.getElementById('cg_2').value={A2!r};")
    pg.wait_for_timeout(200)
    shot(pg, '#cgraModal .modal-box', '24-cgra-prep')
    pg.evaluate(f"saveCgraPrep('{d1}');closeModal('cgraModal')")

    # 25 — statistiques (données fictives présentes : frais, rdv, conseils)
    pg.evaluate("openStats()")
    pg.wait_for_timeout(600)
    shot(pg, '#statsModal .modal-box', '25-stats')
    pg.evaluate("closeModal('statsModal')")

    # 26 — notes de version
    pg.evaluate("localStorage.setItem('mena_seen_v','1.6.1');maybeWhatsNew()")
    pg.wait_for_timeout(300)
    if pg.locator('#wnModal.open').count():
        shot(pg, '#wnModal .modal-box', '26-nouveautes')
        pg.evaluate("closeModal('wnModal')")

    b.close()

# rognage des bords blancs
from PIL import Image, ImageChops
import glob
for f in glob.glob(f'{OUT}/*.png'):
    img = Image.open(f).convert('RGB')
    diff = ImageChops.difference(img, Image.new('RGB', img.size, (255, 255, 255)))
    bb = diff.getbbox()
    if bb:
        l, t, r, bo = bb
        img.crop((max(0, l-10), max(0, t-10), min(img.width, r+10), min(img.height, bo+10))).save(f)
print('TERMINE', LANG, '-', len(os.listdir(OUT)), 'captures')
