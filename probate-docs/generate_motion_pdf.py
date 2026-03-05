"""
LA Superior Court Probate Division — CRC 2.100-2.119 Compliant Pleading PDF
Notice of Motion and Motion to Disqualify Counsel
Case No. 23STPB13044
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

OUTPUT = "/home/user/fiducible/probate-docs/Motion_Disqualify_Counsel_23STPB13044.pdf"

# ── Page geometry ──────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = letter          # 612 x 792 pts  (8.5 x 11 in)
MARGIN_LEFT   = 1.5 * inch       # left margin (line-number gutter lives here)
MARGIN_RIGHT  = 0.5 * inch
MARGIN_TOP    = 1.0 * inch
MARGIN_BOTTOM = 1.0 * inch

TEXT_LEFT  = MARGIN_LEFT         # text starts here
TEXT_RIGHT = PAGE_W - MARGIN_RIGHT
TEXT_WIDTH = TEXT_RIGHT - TEXT_LEFT

LINES_PER_PAGE = 28
LINE_HEIGHT    = (PAGE_H - MARGIN_TOP - MARGIN_BOTTOM) / LINES_PER_PAGE  # ≈ 23.14 pt (double-spaced 12pt)

FONT_NAME  = "Times-Roman"
FONT_BOLD  = "Times-Bold"
FONT_SIZE  = 12
FOOT_SIZE  = 10
LINENUM_SIZE = 9

# Y position of line N (1-based) from top of page
def line_y(n):
    return PAGE_H - MARGIN_TOP - (n - 0.5) * LINE_HEIGHT

# ── Helpers ────────────────────────────────────────────────────────────────────

def new_page(c, page_num, short_title="NOTICE OF MOTION AND MOTION TO DISQUALIFY COUNSEL",
             case_no="Case No. 23STPB13044"):
    """Start a new page, draw line numbers 1-28, draw footer."""
    c.showPage()
    draw_line_numbers(c)
    draw_footer(c, page_num, short_title, case_no)

def draw_line_numbers(c):
    """Draw line numbers 1-28 in the left gutter."""
    c.setFont(FONT_NAME, LINENUM_SIZE)
    c.setFillColor(colors.black)
    for n in range(1, LINES_PER_PAGE + 1):
        y = line_y(n)
        # right-align the number just left of the text margin
        c.drawRightString(MARGIN_LEFT - 6, y - 3, str(n))
    # vertical rule between line numbers and text
    c.setLineWidth(0.5)
    c.line(MARGIN_LEFT - 3, PAGE_H - MARGIN_TOP + 4,
           MARGIN_LEFT - 3, MARGIN_BOTTOM - 4)

def draw_footer(c, page_num, short_title, case_no):
    """Draw page number + horizontal rule + short title at bottom."""
    footer_y = MARGIN_BOTTOM - 18
    # page number
    c.setFont(FONT_NAME, FOOT_SIZE)
    c.drawCentredString(PAGE_W / 2, footer_y + 14, f"- {page_num} -")
    # horizontal rule
    c.setLineWidth(0.75)
    c.line(MARGIN_LEFT, footer_y + 10, TEXT_RIGHT, footer_y + 10)
    # short title + case number
    c.setFont(FONT_NAME, FOOT_SIZE)
    c.drawCentredString(PAGE_W / 2, footer_y, short_title)
    c.drawCentredString(PAGE_W / 2, footer_y - 11, case_no)

def put_text(c, line_n, text, font=FONT_NAME, size=FONT_SIZE,
             indent=0, align="left", color=colors.black):
    """Place text on a specific line number."""
    y = line_y(line_n) - 3
    c.setFont(font, size)
    c.setFillColor(color)
    x = TEXT_LEFT + indent
    if align == "center":
        c.drawCentredString(PAGE_W / 2, y, text)
    elif align == "right":
        c.drawRightString(TEXT_RIGHT, y, text)
    else:
        c.drawString(x, y, text)

def put_wrapped(c, start_line, text, font=FONT_NAME, size=FONT_SIZE,
                indent=0, hanging=0):
    """
    Wrap text across lines starting at start_line.
    indent: left indent for ALL lines (pts beyond TEXT_LEFT).
    hanging: additional indent for lines 2+ (first line uses indent only).
    Returns next available line number.
    """
    from reportlab.pdfbase.pdfmetrics import stringWidth
    max_w = TEXT_WIDTH - indent
    words = text.split()
    line_words = []
    line_n = start_line
    first = True

    def flush(words, ln, first):
        line_x = TEXT_LEFT + indent + (0 if first else hanging)
        w = TEXT_WIDTH - indent - (0 if first else hanging)
        c.setFont(font, size)
        c.setFillColor(colors.black)
        c.drawString(line_x, line_y(ln) - 3, " ".join(words))

    for word in words:
        test = line_words + [word]
        xi = 0 if first else hanging
        if stringWidth(" ".join(test), font, size) <= TEXT_WIDTH - indent - xi:
            line_words.append(word)
        else:
            if line_words:
                flush(line_words, line_n, first)
                line_n += 1
                first = False
            line_words = [word]
    if line_words:
        flush(line_words, line_n, first)
        line_n += 1
    return line_n

# ── Main document ──────────────────────────────────────────────────────────────

def build_pdf():
    c = canvas.Canvas(OUTPUT, pagesize=letter)
    c.setTitle("Notice of Motion and Motion to Disqualify Counsel — 23STPB13044")
    c.setAuthor("Devonge Christopher Dean")
    c.setSubject("Motion to Disqualify Counsel — Evans Law Firm, Inc.")

    # ══════════════════════════════════════════════════════════════
    # PAGE 1 — Caption page
    # ══════════════════════════════════════════════════════════════
    draw_line_numbers(c)
    draw_footer(c, 1,
                short_title="NOTICE OF MOTION AND MOTION TO DISQUALIFY COUNSEL",
                case_no="Case No. 23STPB13044")

    # Lines 1-8: Filer block (left column)
    filer_lines = [
        "DEVONGE CHRISTOPHER DEAN",
        "P.O. Box 83582",
        "Los Angeles, CA 90083",
        "coderchrisdean@protonmail.com",
        "T: 424-345-4299",
        "",
        "Objector, Co-Conservator, and Interested Person,",
        "In Pro Per",
    ]
    for i, txt in enumerate(filer_lines, start=1):
        put_text(c, i, txt, size=FONT_SIZE)

    # Clerk stamp label (right column, lines 2-4)
    c.setFont(FONT_NAME, 9)
    c.setFillColor(colors.grey)
    stamp_x = PAGE_W / 2 + 0.25 * inch
    for ln, label in [(2, "[SPACE FOR CLERK'S FILE STAMP]"),
                      (3, "(Do not type in this area)")]:
        c.drawString(stamp_x, line_y(ln) - 3, label)
    c.setFillColor(colors.black)

    # Lines 10-12: Court name (centered, bold, all caps)
    put_text(c, 10, "SUPERIOR COURT OF THE STATE OF CALIFORNIA",
             font=FONT_BOLD, align="center")
    put_text(c, 12, "COUNTY OF LOS ANGELES — PROBATE DIVISION",
             font=FONT_BOLD, align="center")

    # Line 14-15: Case title (left) + case number (right) — two column
    put_text(c, 14, "In re Durable Power of Attorney of")
    put_text(c, 14, "Case No. 23STPB13044", align="right")
    put_text(c, 15, "DOCK DEAN, Conservatee.", font=FONT_BOLD)
    put_text(c, 15, "Related: 24STPB01681", align="right")

    # Horizontal rule under case title
    rule_y = line_y(15) - LINE_HEIGHT * 0.4
    c.setLineWidth(0.75)
    c.line(TEXT_LEFT, rule_y, TEXT_RIGHT, rule_y)

    # Lines 17-19: Document title (centered, bold, all caps)
    put_text(c, 17, "NOTICE OF MOTION AND MOTION TO DISQUALIFY COUNSEL",
             font=FONT_BOLD, align="center")

    # Lines 21-24: Hearing block
    tab = 1.6 * inch
    hearing = [
        (21, "Hearing Date:", "May 22, 2026"),
        (22, "Time:",         "9:30 a.m."),
        (23, "Department:",   "67"),
        (24, "Judge:",        "Hon. Daniel Juarez"),
    ]
    for ln, label, val in hearing:
        put_text(c, ln, label, font=FONT_BOLD, indent=0.25*inch)
        put_text(c, ln, val,   indent=tab)

    # ══════════════════════════════════════════════════════════════
    # PAGE 2 — Notice paragraph + Grounds 1-2
    # ══════════════════════════════════════════════════════════════
    new_page(c, 2)

    ln = 1
    # "TO ALL PARTIES" line
    put_text(c, ln, "TO ALL PARTIES AND THEIR ATTORNEYS OF RECORD:", font=FONT_BOLD)
    ln += 2

    # Opening paragraph
    opening = (
        "PLEASE TAKE NOTICE that on May 22, 2026, at 9:30 a.m. in Department 67, "
        "Movant DEVONGE CHRISTOPHER DEAN, appearing in pro per as Co-Conservator and "
        "Interested Person under Probate Code \u00a7 48, will and hereby does move for "
        "an order disqualifying EVANS LAW FIRM, INC. and INGRID M. EVANS (collectively, "
        "\u201cEvans\u201d) from representing Keithra Snowden or any other party, in any "
        "capacity, in Case No. 23STPB13044 and all related proceedings. The grounds are "
        "set forth fully in the concurrently filed Memorandum of Points and Authorities "
        "and Declaration of Devonge Christopher Dean. In summary:"
    )
    ln = put_wrapped(c, ln, opening, indent=0.5*inch)
    ln += 1

    # Ground 1
    put_text(c, ln, "1.  CONCURRENT CONFLICT OF INTEREST (RULE 1.7).", font=FONT_BOLD, indent=0.5*inch)
    ln += 2
    g1 = (
        "Evans jointly represented both co-conservators in this action and in related "
        "Case No. 24STPB01681. While still representing both clients, Evans filed a "
        "Petition for Removal of Co-Conservator against Movant, using confidential "
        "information obtained during the joint representation. Although a Substitution "
        "of Attorney for Snowden has since been filed, substitution does not moot this "
        "motion because Evans retains adverse financial interests and ongoing court-filing "
        "access as set forth below."
    )
    ln = put_wrapped(c, ln, g1, indent=0.5*inch)
    ln += 1

    # Ground 2
    put_text(c, ln, "2.  PERSONAL FINANCIAL INTEREST AS ONGOING CONFLICT", font=FONT_BOLD, indent=0.5*inch)
    ln += 1
    put_text(c, ln, "    (RULES 1.7(b) AND 1.8).", font=FONT_BOLD, indent=0.5*inch)
    ln += 2
    g2 = (
        "Evans filed a Notice of Attorneys\u2019 Lien on February 2, 2026, asserting a "
        "personal financial claim against conservatorship assets and against Movant "
        "personally. The lien references a fee agreement dated February 7, 2024 \u2014 "
        "yet Evans\u2019 own correspondence ties that agreement to a \u201cSuper Bowl "
        "Sunday emergency\u201d that occurred on February 11, 2024, four days after the "
        "stated signature date. The lien is facially defective and has transformed Evans "
        "into an Interested Party with adverse financial interests no substitution can "
        "extinguish."
    )
    ln = put_wrapped(c, ln, g2, indent=0.5*inch)

    # ══════════════════════════════════════════════════════════════
    # PAGE 3 — Grounds 3-4
    # ══════════════════════════════════════════════════════════════
    new_page(c, 3)

    ln = 1
    # Ground 3
    put_text(c, ln, "3.  REQUESTS FOR SPECIAL NOTICE AS STRUCTURAL ONGOING", font=FONT_BOLD, indent=0.5*inch)
    ln += 1
    put_text(c, ln, "    PREJUDICE.", font=FONT_BOLD, indent=0.5*inch)
    ln += 2
    g3 = (
        "Evans filed Requests for Special Notice in both proceedings simultaneously with "
        "her withdrawal and lien filings on February 2, 2026. Those filings create a "
        "mandatory, perpetual obligation to serve Evans with every future petition, "
        "report, inventory, and court order in both cases until vacated by court order "
        "\u2014 giving her an ongoing pipeline of privileged filings while she holds "
        "adverse financial interests and two years of Movant\u2019s confidential "
        "communications."
    )
    ln = put_wrapped(c, ln, g3, indent=0.5*inch)
    ln += 1

    # Ground 4
    put_text(c, ln, "4.  BREACH OF DUTY OF LOYALTY DURING JOINT REPRESENTATION", font=FONT_BOLD, indent=0.5*inch)
    ln += 1
    put_text(c, ln, "    (RULES 1.4 AND 1.7).", font=FONT_BOLD, indent=0.5*inch)
    ln += 2
    g4 = (
        "Evans differentially withheld material estate planning documents from Movant "
        "while sharing them with Co-Conservator Snowden, and presented a trust structure "
        "to Movant without disclosing that it was designed to reduce judicial oversight "
        "of her own fees \u2014 documented independently by CAC David P. Stroud in his "
        "Second GAL Report (March 21, 2025), September 2025 Report, and Fifth CAC Report "
        "(January 31, 2026)."
    )
    ln = put_wrapped(c, ln, g4, indent=0.5*inch)

    # ══════════════════════════════════════════════════════════════
    # PAGE 4 — Statutory basis + Signature
    # ══════════════════════════════════════════════════════════════
    new_page(c, 4)

    ln = 1
    basis = (
        "This Motion is made pursuant to Code of Civil Procedure \u00a7 128(a)(5); "
        "California Rules of Professional Conduct Rules 1.4, 1.7, and 1.9; Probate Code "
        "\u00a7\u00a7 2640\u20132644; Business & Professions Code \u00a7 6147; "
        "People ex rel. Dept. of Corporations v. SpeeDee Oil Change Systems, Inc. (1999) "
        "20 Cal.4th 1135; and Flatt v. Superior Court (1994) 9 Cal.4th 275. This Motion "
        "is based on this Notice, the separately filed Memorandum of Points and "
        "Authorities, the concurrently filed Declaration of Devonge Christopher Dean with "
        "all exhibits, the Fifth Report of Court-Appointed Counsel David P. Stroud, and "
        "all papers and records on file in this action."
    )
    ln = put_wrapped(c, ln, basis, indent=0.5*inch)
    ln += 2

    # Dated line
    put_text(c, ln, "DATED:  _______________________________")
    ln += 4

    # Signature block
    c.setLineWidth(0.75)
    sig_y = line_y(ln) - 3
    c.line(TEXT_LEFT, sig_y, TEXT_LEFT + 3.5*inch, sig_y)
    ln += 1
    put_text(c, ln, "DEVONGE CHRISTOPHER DEAN", font=FONT_BOLD)
    ln += 1
    put_text(c, ln, "In Pro Per / Co-Conservator / Objector / Interested Person")

    # ── Save ──────────────────────────────────────────────────────
    c.save()
    print(f"PDF written to: {OUTPUT}")

if __name__ == "__main__":
    build_pdf()
