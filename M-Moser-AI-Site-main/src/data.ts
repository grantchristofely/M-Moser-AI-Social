export const platforms = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    avatar: 'https://vcpoirxbzfkhetlcvkpw.supabase.co/storage/v1/object/public/Brand/AI%20Avatars/Gemini_Generated_Image_1xifx21xifx21xif.png',
    mentalModel: 'Thinking Partner',
    bestFor: 'Brainstorming, ideation, exploring options',
    thinkOfItAs: 'The colleague who asks the questions no one else is asking — and helps you see around corners before you walk into a room.',
    whereItFitsBest: [
      'Early-stage thinking',
      'Strategy development',
      'Ideation sessions',
      'Preparation for high-stakes conversations',
      'Pressure-testing ideas before presenting them'
    ],
    caveat: 'ChatGPT can sound confident even when uncertain. It works best when you push back, iterate, and treat its outputs as a starting point — not a final answer.'
  },
  {
    id: 'claude',
    name: 'Claude',
    avatar: 'https://vcpoirxbzfkhetlcvkpw.supabase.co/storage/v1/object/public/Brand/AI%20Avatars/Gemini_Generated_Image_5ss7jo5ss7jo5ss7.png',
    mentalModel: 'Super Smart Co-Worker',
    bestFor: 'Task execution, precise drafting, deep analysis',
    thinkOfItAs: 'The sharpest person on the team who also happens to have read everything. Calm, careful, and exceptionally good at producing clean work under pressure.',
    whereItFitsBest: [
      'Document drafting',
      'Contract and spec review',
      'Long-document analysis',
      'Structured frameworks',
      'HR and leadership documentation',
      'Proposal writing'
    ],
    caveat: 'Claude\'s strength is depth and precision, not speed of ideation. For open-ended brainstorming, ChatGPT tends to feel more generative.'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    avatar: 'https://vcpoirxbzfkhetlcvkpw.supabase.co/storage/v1/object/public/Brand/AI%20Avatars/Gemini_Generated_Image_nlfrlenlfrlenlfr.png',
    mentalModel: 'Creative Partner',
    bestFor: 'Research synthesis, visual ideation, content transformation',
    thinkOfItAs: 'A creative studio and research lab combined — one that can turn a stack of source documents into a podcast, a presentation, or a set of concept visuals.',
    whereItFitsBest: [
      'Client research',
      'Content generation',
      'Moodboarding',
      'Presentation creation',
      'Audio briefings',
      'Long-document synthesis'
    ],
    caveat: 'Gemini can hedge rather than commit. When you need a decisive recommendation, Claude or ChatGPT will be more direct.'
  },
  {
    id: 'copilot',
    name: 'Copilot',
    avatar: 'https://vcpoirxbzfkhetlcvkpw.supabase.co/storage/v1/object/public/Brand/AI%20Avatars/Gemini_Generated_Image_ctwgvwctwgvwctwg.png',
    mentalModel: 'Personal Assistant',
    bestFor: 'Organization, meeting notes, Microsoft 365 workflows',
    thinkOfItAs: 'The assistant who handles everything you shouldn\'t be doing yourself — meeting notes, email summaries, document formatting, data queries — so your time stays on higher-value work.',
    whereItFitsBest: [
      'Meeting documentation',
      'Email management',
      'Presentation building',
      'Data analysis in Excel',
      'SharePoint knowledge retrieval',
      'Workflow automation'
    ],
    caveat: 'Copilot\'s output quality is tied to your Microsoft 365 data. The better your document hygiene and SharePoint organization, the more useful it becomes.'
  },
  {
    id: 'photoshop-ai',
    name: 'Photoshop AI',
    avatar: 'https://vcpoirxbzfkhetlcvkpw.supabase.co/storage/v1/object/public/Brand/AI%20Avatars/Gemini_Generated_Image_ivzsrkivzsrkivzs.png',
    mentalModel: 'Visual Editor',
    bestFor: 'Editing, refining, and producing design assets',
    thinkOfItAs: 'The post-production studio that used to require a specialist and a full day. Now it\'s a set of tools that any team member can use to get visuals to presentation quality, fast.',
    whereItFitsBest: [
      'Rendering cleanup',
      'Image expansion and reformatting',
      'Concept visualization',
      'Case study production',
      'Contract and specification review via Acrobat AI'
    ],
    caveat: 'Adobe tools are production tools, not ideation tools. They refine and elevate work that already exists — they don\'t replace the thinking that precedes it.'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    avatar: 'https://vcpoirxbzfkhetlcvkpw.supabase.co/storage/v1/object/public/Brand/AI%20Avatars/Gemini_Generated_Image_c8de79c8de79c8de.png',
    mentalModel: 'Research Engine',
    bestFor: 'Current, sourced, auditable intelligence',
    thinkOfItAs: 'A research assistant who always shows their work — no hallucinated statistics, no outdated training data, no unsourced claims.',
    whereItFitsBest: [
      'Client intelligence before pursuits',
      'Competitive research',
      'Regulatory and code lookups',
      'Supply chain and market conditions',
      'Thought leadership topic validation'
    ],
    caveat: 'Perplexity is a research tool, not a reasoning or drafting tool. Once you have the facts, take them to Claude or ChatGPT to do something with them.'
  }
];

export const ecosystems = [
  {
    platformId: 'chatgpt',
    name: 'ChatGPT (OpenAI)',
    features: [
      { name: 'Canvas', description: 'A collaborative document and code workspace where you can edit specific sections without rewriting everything. Functions like a shared Google Doc with AI built in. Strong for drafting, iterating on proposals, and refining written deliverables.' },
      { name: 'Operator', description: 'An agentic system that can navigate the web, click, scroll, type, and complete tasks on your behalf autonomously. Still maturing, but represents ChatGPT moving from conversation to action.' },
      { name: 'Sora', description: 'AI video generation, currently a standalone app and being integrated into ChatGPT. Generates high-fidelity video from text prompts with character consistency and audio sync. Worth tracking as it matures.' },
      { name: 'DALL-E', description: 'Image generation native inside ChatGPT. Fast concept visuals from text prompts without leaving the conversation.' },
      { name: 'GPT Projects', description: 'Persistent workspaces that store context, files, and instructions across conversations. Closest equivalent to Claude\'s Projects feature.' },
      { name: 'Custom GPTs / App Store', description: 'An SDK that allows third-party platforms (Canva, Spotify, and others) to plug into ChatGPT as callable apps. Extends ChatGPT\'s reach into external tools and workflows.' }
    ]
  },
  {
    platformId: 'claude',
    name: 'Claude (Anthropic)',
    features: [
      { name: 'Claude Projects', description: 'Persistent workspaces with memory across conversations. Upload documents, style guides, and reference material that Claude retains and applies consistently. Highly relevant for account teams managing client context over time.' },
      { name: 'Claude Code', description: 'A terminal-based coding agent for developers. Useful for any team building internal tools, automations, or scripts.' },
      { name: 'Claude in Chrome (beta)', description: 'A browsing agent that reads pages, fills forms, and assists while you work in the browser.' },
      { name: 'Claude in Excel / PowerPoint', description: 'AI assistance directly inside Microsoft Office. Brings Claude\'s precision drafting and analysis into the tools where work already happens.' },
      { name: 'Cowork (beta)', description: 'A desktop tool for non-developers to automate file and task management using Claude. Worth watching as it develops.' }
    ]
  },
  {
    platformId: 'gemini',
    name: 'Gemini (Google)',
    features: [
      { name: 'NotebookLM', description: 'The standout tool in the entire Google ecosystem. Upload documents, Drive files, YouTube videos, or web links, and Gemini becomes an expert on your specific material — with every response grounded in your sources and cited. Can then generate Audio Overviews (podcast-style conversations about your content), slide decks, infographics, mind maps, reports, and flashcards. Directly applicable to client research, proposal prep, and project onboarding.' },
      { name: 'Flow', description: 'Built for longer creative video projects. Generate consistent characters and scenes across multiple clips, stitch them into a narrative, and generate synchronized background audio. Absorbing Whisk (image remixing) by April 2026.' },
      { name: 'Imagen / Nano Banana', description: 'Image generation with character consistency across edits. Good for branding, moodboarding, and marketing assets.' },
      { name: 'Veo 3', description: 'Video generation with synchronized audio. Google\'s most advanced video tool, available on AI Ultra.' },
      { name: 'Stitch', description: 'A UI design assistant for creating consistent interface layouts. More relevant for tech and product teams.' },
      { name: 'Gemini in Google Workspace', description: 'Native AI inside Docs, Sheets, Slides, Gmail, and Meet. The highest-ROI entry point for Google-native teams.' },
      { name: 'Gems', description: 'Custom AI assistants with persistent instructions — similar to ChatGPT\'s Custom GPTs. Build a firm-specific assistant trained on your standards and frameworks.' },
      { name: 'Deep Research', description: 'A multi-step research agent that synthesizes across many sources into a structured, shareable report. Best-in-class for competitive research and market intelligence.' },
      { name: 'Google AI Studio / Opal', description: 'No-code app building and workflow automation tools for teams wanting to build lightweight internal tools without a developer.' }
    ]
  },
  {
    platformId: 'copilot',
    name: 'Microsoft Copilot',
    features: [
      { name: 'Copilot in Word, Excel, PowerPoint, Outlook, Teams', description: 'Native AI in every major Office app. Draft documents, summarize emails, build presentations from a Word document, run Python-powered data analysis in Excel without writing a single line of code.' },
      { name: 'Copilot in Teams', description: 'Meeting transcription, real-time summaries, follow-up action items, and automatic note-taking. The highest daily-use value for most staff.' },
      { name: 'Microsoft Designer', description: 'AI-generated images, templates, and branded design assets integrated natively into Microsoft 365. Competes with Canva for quick visual creation inside the Office environment.' },
      { name: 'Copilot Studio', description: 'A platform for building custom AI agents that connect to enterprise knowledge sources and execute autonomous workflows. Build a specialized Copilot for a specific process — project intake, account onboarding, compliance checks.' },
      { name: 'Agent Builder', description: 'Lightweight version of Copilot Studio for non-developers. Build simple agents without coding.' },
      { name: 'Power Automate', description: 'Workflow automation connected to Copilot. The native automation layer for connecting Microsoft processes — the equivalent of Zapier inside Microsoft 365.' },
      { name: 'SharePoint Copilot', description: 'AI that works directly on your SharePoint document libraries. Ask questions across your files and get cited, synthesized answers. Directly relevant for firms with structured project and account documentation in SharePoint.' }
    ]
  },
  {
    platformId: 'photoshop-ai',
    name: 'Photoshop AI (Adobe)',
    features: [
      { name: 'Photoshop Generative Fill / Remove', description: 'Select any area and fill it with AI-generated content, or remove objects seamlessly. The flagship time-saver for rendering cleanup and image post-production.' },
      { name: 'Adobe Firefly', description: 'Adobe\'s underlying generative AI model, powering image generation across Photoshop, Illustrator, and Express. Trained on licensed content — important for commercial use.' },
      { name: 'Adobe Express AI', description: 'Quick graphic creation for non-designers. Templates, brand kit application, and rapid resizing across formats.' },
      { name: 'Illustrator AI (Generative Shape Fill, Text to Vector)', description: 'Generate vector graphics and diagrams from text prompts directly in Illustrator. Useful for diagramming, spatial schematics, and infographics.' },
      { name: 'Premiere Pro AI', description: 'Video editing with AI-powered auto-captions, scene editing, audio enhancement, and generative B-roll. Turns raw footage into polished case study content faster.' },
      { name: 'Acrobat AI Assistant', description: 'Reads and interrogates PDFs. Ask questions about a 200-page specification document and get cited answers in seconds. Directly applicable to contract review, RFP analysis, and specification documents.' }
    ]
  },
  {
    platformId: 'perplexity',
    name: 'Perplexity',
    features: [
      { name: 'Perplexity Search', description: 'Real-time web research with every answer linked directly to its source. Audit-able and traceable — suitable for professional use where accuracy matters.' },
      { name: 'Perplexity Spaces', description: 'Collaborative research workspaces where teams can share searches and build shared knowledge on a topic, client, or pursuit. Replaces scattered email threads with a live shared intelligence base.' },
      { name: 'Deep Research Mode', description: 'A multi-step research agent that synthesizes across dozens of sources into a structured report. Best-in-class for competitive and market intelligence when you need depth, not just a quick fact.' }
    ]
  }
];

export const roles = [
  'Strategy',
  'Design',
  'Engineering',
  'Architecture',
  'Sustainability',
  'Brand / Marketing',
  'Leadership',
  'Operations',
  'All Roles'
];

export const useCases = [
  // ChatGPT
  { role: 'Strategy', platformId: 'chatgpt', headline: 'Challenge Assumptions', description: 'Paste a client\'s brief and ask ChatGPT to challenge every assumption in it. What is the brief not saying? What organizational tensions might be hiding behind the stated requirements? Use it to prepare sharper questions before a discovery session.' },
  { role: 'Design', platformId: 'chatgpt', headline: 'Concept Generation', description: 'Hit a creative block on a concept direction? Describe the client, the site, and the constraints and ask ChatGPT to generate 10 different conceptual lenses — not designs, but frameworks for thinking about the space. Use it to break out of your default aesthetic.' },
  { role: 'Engineering', platformId: 'chatgpt', headline: 'System Tradeoffs', description: 'Think through system selection tradeoffs early. "What are the arguments for and against a radiant cooling system in a high-density open office in a humid climate?" ChatGPT reasons through tradeoffs conversationally in a way a spec sheet can\'t.' },
  { role: 'Leadership', platformId: 'chatgpt', headline: 'Roleplay Conversations', description: 'Preparing for a difficult conversation with a team member or client? Roleplay it first. Describe the person, the situation, and the dynamic — have ChatGPT push back the way they might. Arrive better prepared.' },
  { role: 'Sustainability', platformId: 'chatgpt', headline: 'Stress-Test Strategies', description: 'Brainstorm which sustainability certifications actually align with a client\'s stated goals versus which ones are performative. Use it to stress-test a sustainability strategy before presenting it — what would a skeptical client ask?' },
  { role: 'Brand / Marketing', platformId: 'chatgpt', headline: 'Explore Positioning Angles', description: 'Explore positioning angles for a proposal or thought leadership piece. Ask ChatGPT to argue five different ways your firm could frame its integration offer to a financial services client versus a tech client. Find the angle that resonates before you start writing.' },
  { role: 'Operations', platformId: 'chatgpt', headline: 'Process Redesign', description: 'Use it to think through process redesign. "We have an account onboarding process that takes six weeks. Here\'s what\'s in it. What\'s likely causing the friction?" It reasons through operational problems conversationally and generates options worth testing.' },
  { role: 'Architecture', platformId: 'chatgpt', headline: 'Spatial Organizing Principles', description: 'In early massing exploration, describe site constraints, program requirements, and client culture, and ask ChatGPT to generate a range of spatial organizing principles — courtyard, spine, cluster, threshold — with a rationale for each. Not a design tool, but a thinking scaffold.' },

  // Claude
  { role: 'Strategy', platformId: 'claude', headline: 'Structured Account Briefs', description: 'Feed Claude a client\'s annual report, their RFP, and your discovery notes. Ask it to produce a structured account brief: stated priorities, likely unstated concerns, key stakeholder success metrics, and where your firm\'s offer is strongest. Clean and ready to share internally.' },
  { role: 'Design', platformId: 'claude', headline: 'Design Narratives', description: 'Draft a design narrative for a proposal or presentation. Give Claude your concept description, the client\'s values, and the project brief. It produces polished, precise prose that translates spatial thinking into language that resonates with non-designers.' },
  { role: 'Engineering', platformId: 'claude', headline: 'Spec Document Review', description: 'Upload a specification document or basis of design and ask Claude to identify gaps, ambiguities, or sections that conflict with stated performance targets. It reads long technical documents carefully and flags issues a busy engineer might miss under deadline.' },
  { role: 'Architecture', platformId: 'claude', headline: 'Code Compliance Summary', description: 'Produce a code compliance summary. Feed Claude the applicable building codes for a jurisdiction and a project description. It synthesizes which sections apply, what the key requirements are, and where further review is needed — a head start for the technical team.' },
  { role: 'Sustainability', platformId: 'claude', headline: 'Gap Analysis', description: 'Ask Claude to compare a project\'s current specification against LEED, WELL, or BREEAM criteria and produce a gap analysis with recommended actions. More precise and faster than manual cross-referencing.' },
  { role: 'Leadership', platformId: 'claude', headline: 'Professional Documentation', description: 'Draft a performance development plan, a role expectations document, or a difficult conversation script. Claude handles the professional nuance — specific, fair, and constructive — better than most people do from scratch under pressure.' },
  { role: 'Brand / Marketing', platformId: 'claude', headline: 'Calibrated Writing', description: 'Write proposal sections, award submissions, case study narratives, or thought leadership drafts. Claude\'s writing is clean and calibrated — it doesn\'t over-explain, doesn\'t pad, and matches a house style when given examples.' },
  { role: 'Operations', platformId: 'claude', headline: 'Contract Summaries', description: 'Summarize a complex contract or service proposal into a one-page plain-language summary. Flag scope gaps, undefined responsibilities, and ambiguous language. Reduces the time between receiving a document and understanding what it actually says.' },
  { role: 'All Roles', platformId: 'claude', headline: 'Long Document Interrogation', description: 'For any long document — specification, report, strategy transcript, lease — Claude can read the whole thing and answer specific questions about it. "What does this document say about MEP scope exclusions?" It\'s the fastest way to work across large volumes of project documentation.' },

  // Gemini
  { role: 'Strategy', platformId: 'gemini', headline: 'NotebookLM Research', description: 'Build a research notebook from a client\'s public filings, press releases, industry reports, and any prior account notes. Ask it questions: "What are this company\'s top real estate priorities based on these sources?" Every answer is cited. Instant client intelligence without hours of manual reading.' },
  { role: 'Design', platformId: 'gemini', headline: 'Exploratory Moodboards', description: 'Use Imagen or Nano Banana to generate exploratory moodboard imagery in early concept sessions — not final visuals, but rapid visual language tests. Try 10 aesthetic directions in the time it used to take to curate a reference board.' },
  { role: 'Engineering', platformId: 'gemini', headline: 'NotebookLM Standards', description: 'Load ASHRAE standards, project specifications, and a basis of design into a notebook. Ask technical questions across all three sources simultaneously. The AI stays grounded in the documents — no hallucinated answers.' },
  { role: 'Architecture', platformId: 'gemini', headline: 'Deep Research Briefings', description: 'Use Gemini\'s Deep Research to produce a structured briefing on a building type, district, or planning context before a project kicks off. Current, sourced, and synthesized — faster than manual desk research.' },
  { role: 'Sustainability', platformId: 'gemini', headline: 'NotebookLM Certification', description: 'Build a NotebookLM notebook from certification guides (LEED, WELL, BREEAM, RESET), your project brief, and relevant precedent projects. Ask it to identify which credits are achievable given the project parameters and which present the highest risk.' },
  { role: 'Brand / Marketing', platformId: 'gemini', headline: 'Flow + Veo Video Narratives', description: 'Translate a completed project strategy or case study into a short video narrative for client presentations or award submissions. Consistent visual language, background audio, and scene transitions — without a production budget.' },
  { role: 'Leadership', platformId: 'gemini', headline: 'Custom Gems', description: 'Build a custom Gem trained on your firm\'s strategic framework, standards, and communication guidelines. Use it as an on-demand thought partner that already understands your organizational context.' },
  { role: 'Operations', platformId: 'gemini', headline: 'NotebookLM Audio Overviews', description: 'Turn a dense project handover document or onboarding package into an Audio Overview — a podcast-style conversation that new project team members can listen to. Faster absorption of complex information than reading alone.' },
  { role: 'All Roles', platformId: 'gemini', headline: 'Deep Research Synthesis', description: 'Before any major pursuit, workshop, or client meeting, use Gemini\'s Deep Research to generate a multi-source briefing on the topic, sector, or client. Synthesizes across dozens of sources in minutes with a structured output ready to share.' },

  // Copilot
  { role: 'Strategy', platformId: 'copilot', headline: 'Meeting Summaries', description: 'Use Copilot in Teams to generate a structured summary of every client discovery meeting — decisions, action items, open questions — automatically. No more relying on someone\'s memory or handwritten notes.' },
  { role: 'Design', platformId: 'copilot', headline: 'Word to PowerPoint', description: 'Convert a written design narrative or strategy document directly into a structured PowerPoint presentation. Copilot builds the slide architecture from the Word doc — saving the blank-slide problem and getting the story sequenced before design starts.' },
  { role: 'Engineering', platformId: 'copilot', headline: 'Excel Data Analysis', description: 'Use Copilot in Excel to run analysis on project cost data, schedule milestones, or change order histories without writing formulas. Ask: "Which project phases consistently overrun and by how much?" It reads your data and answers.' },
  { role: 'Architecture', platformId: 'copilot', headline: 'SharePoint Knowledge Retrieval', description: 'Use SharePoint Copilot to search across all past project documentation — specifications, RFI logs, change orders — and surface relevant precedents for a current project. "What were the coordination issues on our last three projects in this sector?"' },
  { role: 'Sustainability', platformId: 'copilot', headline: 'Copilot Studio Agents', description: 'Build a Copilot Studio agent that houses your firm\'s sustainability standards, certification thresholds, and material specifications. Any team member can ask it questions and get answers grounded in your actual standards, not generic web results.' },
  { role: 'Leadership', platformId: 'copilot', headline: 'Outlook Email Triage', description: 'Use Copilot in Outlook to triage and summarize long email threads across multiple accounts. Surface what needs a response, what\'s been resolved, and what\'s been waiting too long. Keeps leadership time focused on decisions, not email management.' },
  { role: 'Brand / Marketing', platformId: 'copilot', headline: 'Microsoft Designer', description: 'Use Microsoft Designer inside PowerPoint for fast, on-brand visual creation — proposal covers, section dividers, concept imagery — without leaving the Office environment or waiting on a designer.' },
  { role: 'Operations', platformId: 'copilot', headline: 'OneNote Project Logs', description: 'Use Copilot in OneNote to maintain a running project log that auto-summarizes each session, tracks evolving decisions, and builds institutional memory across the full project lifecycle. Solves the problem of knowledge living only in one person\'s head.' },
  { role: 'All Roles', platformId: 'copilot', headline: 'Teams Meeting Documentation', description: 'Use Teams Copilot for every internal and client meeting. Transcription, summary, action items — automatically. Documentation becomes effortless, and the project log writes itself.' },

  // Photoshop AI
  { role: 'Design', platformId: 'photoshop-ai', headline: 'Generative Fill Cleanup', description: 'Use Generative Fill to remove unwanted elements from design renderings — temporary fixtures, construction details, placeholder furniture — without manual masking. Faster post-production on every image.' },
  { role: 'Architecture', platformId: 'photoshop-ai', headline: 'Generative Expand Reframing', description: 'Use Generative Expand to reframe project photography for different presentation formats. A tight portrait crop becomes a wide landscape banner for a proposal cover without losing quality or context.' },
  { role: 'Engineering', platformId: 'photoshop-ai', headline: 'Acrobat AI Interrogation', description: 'Use Acrobat AI Assistant to interrogate large technical specification packages. Ask: "What are the air quality performance requirements in this document?" It reads the whole document and gives you a cited answer — faster than manual search.' },
  { role: 'Sustainability', platformId: 'photoshop-ai', headline: 'Firefly Visualizations', description: 'Generate visualizations of sustainable design features — green roofs, biophilic elements, natural light conditions — using Firefly from a text description. Useful in early client conversations before design is developed enough for rendered visuals.' },
  { role: 'Strategy', platformId: 'photoshop-ai', headline: 'Rapid Prototyping', description: 'Use Generative Fill to rapidly prototype different furniture configurations, spatial densities, or programming layouts within a rendered floor plan image. A fast visual communication tool in strategy workshops.' },
  { role: 'Brand / Marketing', platformId: 'photoshop-ai', headline: 'Asset Production', description: 'Produce case study imagery, award submission graphics, and social content using Firefly and Adobe Express. Repurpose project photography into on-brand marketing assets without a dedicated graphic design resource.' },
  { role: 'Leadership', platformId: 'photoshop-ai', headline: 'Premiere Pro AI Editing', description: 'Use Premiere Pro\'s AI editing tools to produce project closeout videos, team highlights, or thought leadership content faster. Auto-captions, scene editing, and audio cleanup built in — no editing expertise required.' },
  { role: 'Operations', platformId: 'photoshop-ai', headline: 'Acrobat AI Extraction', description: 'Use Acrobat AI to extract key information from contracts, lease documents, landlord specifications, and RFPs. Reduces document review time before it reaches the team members who need the summary, not the source.' },

  // Perplexity
  { role: 'Strategy', platformId: 'perplexity', headline: 'Client Intelligence', description: 'Before any client meeting or pursuit, search the client: recent announcements, executive moves, real estate activity, competitive landscape. Every answer is source-linked so you can trace and verify before using it in a room.' },
  { role: 'Design', platformId: 'perplexity', headline: 'Emerging Trends', description: 'Research emerging materials, spatial typologies, or precedent projects in a specific sector. Perplexity surfaces current sources — recent publications, case studies, product launches — rather than training data that may be a year or more out of date.' },
  { role: 'Engineering', platformId: 'perplexity', headline: 'Supply Chain & Specs', description: 'Research current lead times, supply chain conditions, or new product specifications for MEP equipment in a specific market. Critical input for pre-construction planning and budget accuracy.' },
  { role: 'Architecture', platformId: 'perplexity', headline: 'Code & Zoning Lookups', description: 'Look up current building codes, zoning regulations, or planning policy updates for a specific jurisdiction. Perplexity finds the current version of the relevant document, not a cached or outdated summary.' },
  { role: 'Sustainability', platformId: 'perplexity', headline: 'Certification Updates', description: 'Research the current status of specific sustainability credits, certification updates, or emerging standards. Certification bodies update frequently — Perplexity finds what\'s current rather than what was current when an AI was last trained.' },
  { role: 'Brand / Marketing', platformId: 'perplexity', headline: 'Perplexity Spaces', description: 'Build a shared Perplexity Space for a major pursuit where the full account and strategy team contributes research — client news, competitor intel, industry trends. A live shared intelligence base rather than scattered email threads.' },
  { role: 'Leadership', platformId: 'perplexity', headline: 'Market Benchmarks', description: 'Research compensation benchmarks, talent market conditions, or organizational design precedents before making a restructuring or hiring decision. Perplexity returns sourced, current data rather than anecdotal or outdated industry surveys.' },
  { role: 'Operations', platformId: 'perplexity', headline: 'Market Conditions', description: 'Research labor market conditions, contractor availability, or material pricing trends in a new geography before committing to a project budget or schedule. Real-time sourced data reduces the risk of pricing based on stale assumptions.' }
];
