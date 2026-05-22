import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

# --- XML Styling Helpers for Professional DOCX Output ---

def set_cell_background(cell, color_hex):
    """Applies a custom hex color background to a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=200, right=200):
    """Sets custom internal padding (cell margins) in dxa (1 dxa = 1/20 pt)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for margin_name, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{margin_name}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_horizontal_divider(doc, color_hex="87A96B"):
    """Adds a thin, horizontal border rule under a section."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(12)
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')  # Size of border
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), color_hex)
    pBdr.append(bottom)
    p._p.get_or_add_pPr().append(pBdr)

# --- Main Document Generation ---

def build_research_paper():
    doc = docx.Document()
    
    # 1. Setup Page Layout (1-inch Margins on all sides)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
    # 2. Configure Global Palette & Normal Style (Calibri, Dark Gray, 1.15 line spacing)
    style_normal = doc.styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Calibri'
    font_normal.size = Pt(11)
    font_normal.color.rgb = RGBColor(0x2B, 0x2B, 0x2B) # Sophisticated charcoal dark gray
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(6)
    
    # 3. Define Main Title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(18)
    title_p.paragraph_format.space_after = Pt(6)
    
    title_run = title_p.add_run("AyurSphere: An Intelligent, Accessibility-Focused MERN Web Platform for Ayurvedic Knowledge Integration and Conversational E-Commerce")
    title_run.font.name = 'Calibri'
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(0x1B, 0x4D, 0x3E) # Deep Forest Green
    
    # 4. Define Author Block
    author_p = doc.add_paragraph()
    author_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    author_p.paragraph_format.space_after = Pt(18)
    
    author_run = author_p.add_run("Varad Khadilkar\n")
    author_run.font.bold = True
    author_run.font.size = Pt(11)
    author_run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
    
    affil_run = author_p.add_run(
        "Department of Computer Engineering, Pune, India | varad.khadilkar@example.com\n"
        "AyurSphere Research Group & Software Systems Division"
    )
    affil_run.font.size = Pt(9.5)
    affil_run.font.italic = True
    affil_run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    
    # Add a styled horizontal line under author block
    add_horizontal_divider(doc, "1B4D3E")
    
    # 5. Define Abstract Block (Indented, italicized, bold label)
    abs_p = doc.add_paragraph()
    abs_p.paragraph_format.left_indent = Inches(0.5)
    abs_p.paragraph_format.right_indent = Inches(0.5)
    abs_p.paragraph_format.space_before = Pt(6)
    abs_p.paragraph_format.space_after = Pt(14)
    abs_p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    abs_label = abs_p.add_run("Abstract—")
    abs_label.bold = True
    abs_label.font.size = Pt(10)
    abs_label.font.color.rgb = RGBColor(0x1B, 0x4D, 0x3E)
    
    abs_text = abs_p.add_run(
        "As modern lifestyle stresses multiply, there is a resurgent interest in traditional herbal medicine, notably Ayurveda. "
        "However, a significant digital gap exists: current web platforms are either static informational repositories lacking "
        "procurement pathways, or commercial e-commerce websites devoid of traditional educational context. Furthermore, accessibility "
        "features tailored for non-tech-savvy or elderly demographics remain highly underdeveloped. This paper presents AyurSphere, "
        "an advanced full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed to bridge this divide. AyurSphere "
        "integrates a comprehensive Ayurvedic plant database containing detailed botanical profiles (including traditional classifications "
        "like Rasa, Virya, Vipaka, and Dosha) with a robust, transactional e-commerce engine. Critically, we address the accessibility "
        "challenge by implementing a highly optimized, multimodal Conversational AI Voice Assistant. Powered by Sarvam AI for "
        "accent-tolerant Speech-to-Text (STT) and natural Text-to-Speech (TTS), coupled with an orchestrator running OpenRouter Llama-3, "
        "the assistant provides natural-language herbal consultations and hands-free interface navigation. To enhance engagement, "
        "the application incorporates a 'Premium Nature' user interface driven by scroll-linked parallax animations (Framer Motion). "
        "We analyze the software architecture, database normalization, conversational AI data pipeline, human-computer interaction (HCI) "
        "paradigms, security frameworks, and system performance optimizations of the implemented platform."
    )
    abs_text.font.size = Pt(10)
    abs_text.font.italic = True
    
    # Keywords
    kw_p = doc.add_paragraph()
    kw_p.paragraph_format.left_indent = Inches(0.5)
    kw_p.paragraph_format.right_indent = Inches(0.5)
    kw_p.paragraph_format.space_after = Pt(18)
    
    kw_label = kw_p.add_run("Keywords—")
    kw_label.bold = True
    kw_label.font.size = Pt(9.5)
    
    kw_text = kw_p.add_run("Ayurvedic Medicine, MERN Stack, Conversational AI, Speech Processing, E-Commerce, Human-Computer Interaction, Web Accessibility, Framer Motion.")
    kw_text.font.size = Pt(9.5)
    kw_text.font.italic = True
    kw_text.font.color.rgb = RGBColor(0x44, 0x44, 0x44)
    
    # --- Helper to add Section Heading ---
    def add_section_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(20)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        
        run = p.add_run(text)
        run.font.name = 'Calibri Light'
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1B, 0x4D, 0x3E) # Deep Forest Green
        
    def add_section_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        
        run = p.add_run(text)
        run.font.name = 'Calibri Light'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x87, 0xA9, 0x6B) # Sage Green
        
    def add_paragraph(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        
        if bold_prefix:
            run_pre = p.add_run(bold_prefix)
            run_pre.bold = True
            run_pre.font.color.rgb = RGBColor(0x1B, 0x4D, 0x3E)
            
        p.add_run(text)
        return p
        
    # --- Section I: Introduction ---
    add_section_h1("I. INTRODUCTION")
    
    add_paragraph(
        "AyurSphere, translated as 'The Science of Life,' represents one of the world's oldest holistic healing systems, "
        "originating in the Indian subcontinent over three millennia ago. It categorizes individual health based on three biological "
        "energies or Doshas---Vata, Pitta, and Kapha---and treats ailments using tailored plant-based formulations. In the contemporary era, "
        "the global pharmaceutical landscape is experiencing a green shift, with consumers actively seeking natural, preventative "
        "wellness alternatives.",
        bold_prefix="Ayurveda, "
    )
    
    add_paragraph(
        "Despite this growing interest, the digital accessibility of authentic Ayurvedic resources remains highly fragmented. "
        "Users navigating the web for herbal remedies encounter a dual-choice dilemma: (1) Informational Repositories that detail "
        "botanical characteristics and traditional uses, but offer no secure mechanism for procuring these remedies; or (2) Commercial "
        "Web Portals that list herbal powders, tablets, and oils, but present them as generic commodities without the foundational "
        "Ayurvedic profile necessary for safe, contextual consumption. Additionally, standard web user interfaces are structurally "
        "optimized for digital natives, leaving older or visually impaired demographics---who are often the primary consumers of "
        "traditional medicine---alienated due to complex menu trees, dense text blocks, and the absence of intuitive voice-based interaction."
    )
    
    add_paragraph(
        "To resolve these systemic deficiencies, we developed AyurSphere, a state-of-the-art, full-stack application utilizing the "
        "MERN (MongoDB, Express.js, React, Node.js) stack. By establishing a normalized database that links botanical attributes directly "
        "with transactional products, and introducing a custom-engineered conversational regional voice pipeline, AyurSphere bridges "
        "the gap between ancient wellness systems and modern accessibility standards."
    )
    
    # --- Section II: Related Work ---
    add_section_h1("II. RELATED WORK")
    
    add_paragraph(
        "Digital healthcare platforms have witnessed unprecedented growth over the last decade. Early web systems, such as WebMD or the "
        "National Center for Complementary and Integrative Health (NCCIH) database, provided comprehensive text searches but relied entirely "
        "on manual mouse-and-keyboard inputs and lacked commerce components. In the domain of Ayurveda, digital repositories like the "
        "Ayurvedic Pharmacopoeia of India have successfully digitized ancient treatises. However, their utility is restricted to academic "
        "research due to highly technical jargon and complex user interfaces."
    )
    
    add_paragraph(
        "Meanwhile, commercial wellness sites focus exclusively on transactional throughput, offering minimal educational context regarding "
        "the specific Rasa (taste), Virya (potency), and Vipaka (post-digestive effect) of the ingredients. Conversational agents in healthcare "
        "have emerged as a viable solution to bridge accessibility gaps. Clinical systems like Babylon Health utilize rigid, rule-based decision "
        "trees for symptom triage, which fail to accommodate natural, expressive conversational patterns. Recent advancements in Large Language "
        "Models (LLMs) have unlocked flexible natural language understanding (NLU). However, adapting LLMs for traditional Indian medicine "
        "introduces specialized linguistic challenges: standard English Speech-to-Text (STT) engines exhibit high Word Error Rates (WER) "
        "when processing Indian-accented speech and specialized Sanskrit terms (e.g., Shatavari, Guduchi), and LLMs are highly prone to "
        "hallucinations, generating unsafe medical advice or incorrect botanical identifications when not rigorously constrained."
    )
    
    # --- Section III: System Design ---
    add_section_h1("III. SYSTEM DESIGN AND ARCHITECTURE")
    
    add_paragraph(
        "The architecture of AyurSphere follows a decoupled Client-Server model. The frontend Client Tier renders the interactive views, "
        "handles audio recording, and operates client-side routing. The backend Application Tier processes API requests, manages "
        "authentication, mediates speech-to-text workflows, and queries the persistent Database Tier. Mongoose, an elegant Object Data "
        "Modeling (ODM) library, enforces structure and validates document relationships, ensuring database integrity."
    )
    
    add_section_h2("A. Database Schema Design and Normalization")
    add_paragraph(
        "To manage the multi-layered relationships between botanical properties, retail products, users, and transactions, we designed a "
        "normalized Mongoose schema structure. MongoDB's document model provides the flexibility required for varying botanical descriptions "
        "while maintaining strict schema structures where transactional integrity is vital. The relationships are structured as follows:"
    )
    
    # 6. Add Schema Table
    table_data = [
        ("User", "username, password (hashed), role, email, mobile, address, medicalHistory", "Owner of Cart and Order entities"),
        ("Plant", "plantName, scientificName, category, description, uses, ayurvedicProfile", "Primary educational catalog entity"),
        ("Product", "plantId (reference), name, price, type (powder, oil, etc.), inStock", "Linked directly to parent Plant model"),
        ("Cart", "userId (reference), items [productId, quantity]", "Aggregates selected items for checkout"),
        ("Order", "userId, items, subTotal, gstAmount, totalAmount, shippingAddress, status", "Snapshot of finalized transactional records")
    ]
    
    table = doc.add_table(rows=1, cols=3)
    table.autofit = False
    
    # Widths: Entity=1 in, Fields=3.5 in, Relations=2 in
    widths = [Inches(1.0), Inches(3.5), Inches(2.0)]
    
    # Format Header Row
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Entity'
    hdr_cells[1].text = 'Key Attribute Fields'
    hdr_cells[2].text = 'Relationships'
    
    for i, cell in enumerate(hdr_cells):
        cell.width = widths[i]
        set_cell_background(cell, "1B4D3E") # Deep Forest Green
        set_cell_margins(cell, top=160, bottom=160, left=120, right=120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            run.font.size = Pt(9.5)
            
    # Populate Rows with alternating green shading
    for idx, (entity, fields, relations) in enumerate(table_data):
        row_cells = table.add_row().cells
        row_cells[0].text = entity
        row_cells[1].text = fields
        row_cells[2].text = relations
        
        bg_hex = "F0F5F2" if idx % 2 == 1 else "FFFFFF" # Alternating nature tint
        for i, cell in enumerate(row_cells):
            cell.width = widths[i]
            set_cell_background(cell, bg_hex)
            set_cell_margins(cell, top=120, bottom=120, left=120, right=120)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.size = Pt(9)
                run.font.name = 'Calibri'
                
    doc.add_paragraph().paragraph_format.space_after = Pt(12) # Spacing after table
    
    # --- Section IV: AI Processing Pipeline ---
    add_section_h1("IV. THE CONVERSATIONAL AI PROCESSING PIPELINE")
    
    add_paragraph(
        "The primary technical innovation of AyurSphere is the end-to-end conversational speech pipeline integrated into the e-commerce "
        "client. The system sequence is divided into five distinct phases, orchestrating local Web Audio APIs, regional AI models, "
        "and generative Large Language Models."
    )
    
    add_section_h2("A. Speech Capture and Translatability (STT)")
    add_paragraph(
        "The client accesses the user's microphone using the HTML5 MediaRecorder API, capturing raw audio in a compressed container (typically "
        "audio/webm). Upon recording termination, the binary blob is dispatched via a multipart POST request to the Express backend. The server "
        "caches the audio temporarily via multer and streams it to the Sarvam AI Speech-to-Text API. The choice of Sarvam AI is mathematically "
        "motivated by its superior acoustic models optimized for Indian English accents (en-IN), resulting in a significantly lower Word Error Rate "
        "(WER) compared to standard global acoustic models."
    )
    
    add_section_h2("B. Contextual Dialog Management and Prompt Engineering")
    add_paragraph(
        "Once transcribed, the plain text is forwarded to OpenRouter's API, targeted at the meta-llama/llama-3-8b-instruct model. To ensure clinical "
        "safety and maintain focus on traditional home remedies, the model is initialized with a strict system instruction. The prompt acts "
        "as a semantic constraint layer. By restricting the outputs to home remedies and establishing standard structural formats, the system "
        "avoids generating unsafe medical claims, thereby mitigating clinical risk and hallucinations."
    )
    
    add_section_h2("C. Speech Synthesis and Playback (TTS)")
    add_paragraph(
        "The LLM response is returned as a markdown text stream. This response is directed to the Sarvam AI Text-to-Speech synthesis API. The backend "
        "configures the model with regional voice identities (targeting en-IN dialects) to maintain character consistency. The synthesized audio is "
        "received as a binary array buffer, converted to a Base64-encoded string, and transmitted to the React client within a single JSON payload. "
        "The client decodes the string and initializes an HTML5 Audio node, providing instantaneous voice playback while displaying the text."
    )
    
    # --- Section V: Detailed Implementation ---
    add_section_h1("V. DETAILED SOFTWARE IMPLEMENTATION")
    
    add_section_h2("A. Express.js Backend & Security Layer")
    add_paragraph(
        "The backend is built around Node.js and Express.js, providing modular routes. Security is enforced through custom middleware. "
        "Passwords are hashed during signup using bcryptjs with a work factor of 10 rounds. Stateless user sessions are authenticated "
        "using JSON Web Tokens (JWT) signed with HMAC-SHA256, transmitted via the Authorization header. This decouples the API server "
        "from persistent session storage, facilitating seamless vertical and horizontal scaling."
    )
    
    add_section_h2("B. React.js Client-Side State and Performance Tuning")
    add_paragraph(
        "The frontend SPA leverages React 18, utilizing the Vite build tool to compile optimized assets. Global states---notably user "
        "authentication status, navigation history, and shopping cart items---are managed using the Context API to minimize prop-drilling. "
        "To handle a large catalog of botanical products without lagging the UI thread, the core page, DashboardPage.jsx, implements "
        "a memoized filtering system. The filtering logic utilizes the useMemo hook, caching computed arrays and only recalculating when the "
        "source dataset, selected categories, or the search term changes."
    )
    
    # 7. Add Code Snippet Callout Block
    code_text = (
        "// useMemo hook optimized client-side dynamic search and filtering\n"
        "const filteredPlants = useMemo(() => {\n"
        "  const lowerSearch = searchTerm.trim().toLowerCase();\n"
        "  return plants.filter((plant) => {\n"
        "    const plantCategory = (plant.category || '').toLowerCase();\n"
        "    const active = (activeCategory || '').toLowerCase();\n"
        "    const categoryMatch = !active || plantCategory === active;\n"
        "    if (!categoryMatch) return false;\n"
        "    if (!lowerSearch) return true;\n"
        "    return plant.plantName.toLowerCase().includes(lowerSearch) ||\n"
        "           plant.scientificName.toLowerCase().includes(lowerSearch);\n"
        "  });\n"
        "}, [plants, activeCategory, searchTerm]);"
    )
    
    code_table = doc.add_table(rows=1, cols=1)
    code_table.autofit = True
    cell = code_table.rows[0].cells[0]
    set_cell_background(cell, "F5F5F5") # Light gray callout background
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Apply left border style to represent code block callout
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    left_border = OxmlElement('w:left')
    left_border.set(qn('w:val'), 'single')
    left_border.set(qn('w:sz'), '24')  # Thick border (3pt)
    left_border.set(qn('w:space'), '0')
    left_border.set(qn('w:color'), '1B4D3E') # Forest green vertical accent
    tcBorders.append(left_border)
    tcPr.append(tcBorders)
    
    code_p = cell.paragraphs[0]
    code_p.paragraph_format.space_before = Pt(4)
    code_p.paragraph_format.space_after = Pt(4)
    code_run = code_p.add_run(code_text)
    code_run.font.name = 'Courier New'
    code_run.font.size = Pt(8.5)
    code_run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # --- Section VI: HCI & UX ---
    add_section_h1("VI. HUMAN-COMPUTER INTERACTION AND UI/UX DESIGN")
    
    add_paragraph(
        "AyurSphere implements a premium 'nature-inspired' design system designed to foster feelings of serenity and botanical immersion. "
        "It incorporates several advanced user experience patterns: Glassmorphism background panels using backdrop filters to preserve spatial "
        "awareness of underlying environmental elements; Scrollytelling Parallax driven by Framer Motion's useTransform hook to transpose multiple "
        "graphic layers based on scroll positioning; and canvas-based Dynamic Particle rendering to simulate natural falling leaves and "
        "enhance environmental immersion. The system's interface has been designed according to HCI heuristic evaluations, optimizing layouts "
        "for readability and visual clarity."
    )
    
    # --- Section VII: Security Analysis ---
    add_section_h1("VII. SECURITY ANALYSIS AND OPTIMIZATION")
    
    add_paragraph(
        "In addition to baseline authorization, several advanced defensive software engineering measures are deployed in AyurSphere. "
        "To mitigate Cross-Site Scripting (XSS), React automatically escapes rendered strings. For rich-text fields (such as admin-added plant entries), "
        "strict HTML sanitization is executed server-side. NoSQL Injection is prevented by mapping all API queries to strongly-typed Mongoose "
        "schemas, rejecting raw query operators. Cross-Origin Resource Sharing (CORS) is configured using a strict origin whitelisting middleware, "
        "and security headers (such as Helmet) are applied to mitigate clickjacking and mime-type sniffing."
    )
    
    # --- Section VIII: Future Work ---
    add_section_h1("VIII. DISCUSSION AND FUTURE DIRECTIONS")
    
    add_paragraph(
        "The current version of AyurSphere provides a highly responsive, end-to-end framework. However, three key research frontiers remain: "
        "(1) Production Payment Systems: transitioning simulated orders into active payment gateways (Razorpay/Stripe) utilizing secure webhooks "
        "for state verification; (2) Spatial Virtual Garden (WebXR): elevating the 2D parallax animations into a immersive 3D nursery where users "
        "can walk around plants in physical space using VR/AR; and (3) ML-Based Leaf Classification: training a convolutional neural network "
        "(e.g., MobileNet) to identify medicinal plants from user-uploaded photos and directly recommend purchasing avenues."
    )
    
    # --- Section IX: Conclusion ---
    add_section_h1("IX. CONCLUSION")
    
    add_paragraph(
        "AyurSphere successfully demonstrates how ancient health methodologies can be digitized and enhanced using modern software design. "
        "By pairing a robust, decoupled MERN stack with a custom regional Conversational AI Voice Assistant and high-performance immersive interface "
        "designs, the application sets a new precedent for accessibility and education in the health and wellness space. The decoupling of core "
        "components, optimized state memoization, and strict security layers ensure that AyurSphere is highly scalable and ready for production deployment."
    )
    
    # --- Section X: References ---
    add_section_h1("X. REFERENCES")
    
    references = [
        "M. S. Valiathan, The Legacy of Caraka, Orient Blackswan, 2003.",
        "D. B. Fogel, \"The digital transformation of healthcare,\" Journal of Clinical Investigation, vol. 129, no. 8, pp. 3012--3013, 2019.",
        "A. L. L'Heureux et al., \"Machine Learning with Big Data: Challenges and Approaches,\" IEEE Access, vol. 5, pp. 7776--7797, 2017.",
        "J. Devlin et al., \"BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding,\" arXiv preprint arXiv:1810.04805, 2018.",
        "A. Vaswani et al., \"Attention is all you need,\" Advances in Neural Information Processing Systems, pp. 5998--6008, 2017.",
        "J. Nielsen, Usability Engineering, Morgan Kaufmann, 1994.",
        "E. Gamma et al., Design Patterns: Elements of Reusable Object-Oriented Software, Addison-Wesley, 1994.",
        "T. Bray et al., \"The JavaScript Object Notation (JSON) Data Interchange Format,\" RFC 8259, 2017."
    ]
    
    for idx, ref in enumerate(references, 1):
        ref_p = doc.add_paragraph()
        ref_p.paragraph_format.left_indent = Inches(0.25)
        ref_p.paragraph_format.first_line_indent = Inches(-0.25)
        ref_p.paragraph_format.space_after = Pt(4)
        
        num_run = ref_p.add_run(f"[{idx}] ")
        num_run.bold = True
        num_run.font.color.rgb = RGBColor(0x1B, 0x4D, 0x3E)
        
        ref_p.add_run(ref)
        for run in ref_p.runs:
            run.font.size = Pt(9.5)
            
    # Save the output file
    output_path = "/home/varad/Desktop/Ayursphere 2.0/AyurSphere-mern/AyurSphere_Research_Paper.docx"
    doc.save(output_path)
    print(f"Word document successfully created at: {output_path}")

if __name__ == "__main__":
    build_research_paper()
