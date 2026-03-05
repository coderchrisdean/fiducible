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
from reportlab.pdfbase.pdfmetrics import stringWidth

OUTPUT = "/home/user/fiducible/probate-docs/Motion_Disqualify_Counsel_23STPB13044.pdf"

# ── Font registration (Liberation Serif — metric-compatible with Times New Roman) ──
_FONT_DIR = "/usr/share/fonts/truetype/liberation"
pdfmetrics.registerFont(TTFont("LSerif",      f"{_FONT_DIR}/LiberationSerif-Regular.ttf"))
pdfmetrics.registerFont(TTFont("LSerif-Bold", f"{_FONT_DIR}/LiberationSerif-Bold.ttf"))
pdfmetrics.registerFont(TTFont("LSerif-Ital", f"{_FONT_DIR}/LiberationSerif-Italic.ttf"))

FONT_NAME  = "LSerif"
FONT_BOLD  = "LSerif-Bold"
FONT_ITAL  = "LSerif-Ital"
FONT_SIZE  = 12
FOOT_SIZE  = 10
LINENUM_SIZE = 9

# ── Page geometry ───────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = letter          # 612 x 792 pts  (8.5 x 11 in)
MARGIN_LEFT   = 1.5 * inch       # gutter + line-number space
MARGIN_RIGHT  = 0.5 * inch
MARGIN_TOP    = 1.0 * inch
MARGIN_BOTTOM = 1.0 * inch

TEXT_LEFT  = MARGIN_LEFT
TEXT_RIGHT = PAGE_W - MARGIN_RIGHT
TEXT_WIDTH = TEXT_RIGHT - TEXT_LEFT

LINES_PER_PAGE = 28
# Distribute the printable height evenly across 28 lines
LINE_HEIGHT = (PAGE_H - MARGIN_TOP - MARGIN_BOTTOM) / LINES_PER_PAGE  # ≈ 23.14 pt

SHORT_TITLE = "NOTICE OF MOTION AND MOTION TO DISQUALIFY COUNSEL"
CASE_NO     = "Case No. 23STPB13044"


# ── Geometry helpers ────────────────────────────────────────────────────────────

def line_y(n):
    """Baseline Y for line number n (1-based), centred in the line slot."""
    return PAGE_H - MARGIN_TOP - (n - 0.5) * LINE_HEIGHT


# ── Page chrome ─────────────────────────────────────────────────────────────────

def draw_line_numbers(c):
    """Draw line numbers 1-28 in the left gutter plus the vertical rule."""
    c.setFont(FONT_NAME, LINENUM_SIZE)
    c.setFillColor(colors.black)
    for n in range(1, LINES_PER_PAGE + 1):
        y = line_y(n)
        c.drawRightString(MARGIN_LEFT - 6, y - 4, str(n))
    # vertical rule
    c.setLineWidth(0.5)
    c.line(MARGIN_LEFT - 3, PAGE_H - MARGIN_TOP + 4,
           MARGIN_LEFT - 3, MARGIN_BOTTOM - 4)


def draw_footer(c, page_num):
    """Horizontal rule + page number + short title + case number at bottom."""
    footer_y = MARGIN_BOTTOM - 18
    c.setLineWidth(0.75)
    c.line(TEXT_LEFT, footer_y + 24, TEXT_RIGHT, footer_y + 24)
    c.setFont(FONT_NAME, FOOT_SIZE)
    c.setFillColor(colors.black)
    c.drawCentredString(PAGE_W / 2, footer_y + 12, f"- {page_num} -")
    c.drawCentredString(PAGE_W / 2, footer_y + 1,  SHORT_TITLE)
    c.drawCentredString(PAGE_W / 2, footer_y - 10, CASE_NO)


def start_first_page(c):
    draw_line_numbers(c)
    draw_footer(c, 1)


def new_page(c, page_num):
    c.showPage()
    draw_line_numbers(c)
    draw_footer(c, page_num)


# ── Stateful document writer ────────────────────────────────────────────────────

class Doc:
    """
    Tracks the current page number and line number.
    All write methods advance self.ln automatically.
    Page breaks are inserted transparently when content overflows line 28.
    """

    def __init__(self, c):
        self.c    = c
        self.page = 1
        self.ln   = 1

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _ensure(self, lines=1):
        """Start a new page if fewer than `lines` slots remain."""
        if self.ln + lines - 1 > LINES_PER_PAGE:
            self._new_page()

    def _new_page(self):
        self.page += 1
        new_page(self.c, self.page)
        self.ln = 1

    def _put(self, ln, text, font, size, indent, align):
        """Low-level: place text at line slot ln on the current page."""
        y = line_y(ln) - 4
        self.c.setFont(font, size)
        self.c.setFillColor(colors.black)
        x = TEXT_LEFT + indent
        if align == "center":
            self.c.drawCentredString(PAGE_W / 2, y, text)
        elif align == "right":
            self.c.drawRightString(TEXT_RIGHT, y, text)
        else:
            self.c.drawString(x, y, text)

    # ── Public write methods ──────────────────────────────────────────────────

    def skip(self, n=1):
        """Advance n blank lines (with page-break protection)."""
        self.ln += n
        if self.ln > LINES_PER_PAGE:
            self._new_page()

    def text(self, txt, font=None, size=FONT_SIZE, indent=0, align="left"):
        font = font or FONT_NAME
        self._ensure(1)
        self._put(self.ln, txt, font, size, indent, align)
        self.ln += 1

    def wrapped(self, txt, font=None, size=FONT_SIZE, indent=0, hanging=0):
        """
        Word-wrap txt into lines, placing each on the next available line slot.
        Transparently paginates when line 28 is reached.
        indent:  pts past TEXT_LEFT for all lines.
        hanging: additional pts for lines 2+.
        """
        font = font or FONT_NAME
        words = txt.split()
        buf   = []
        first = True

        def flush(buf, first):
            xi = indent + (0 if first else hanging)
            available = TEXT_WIDTH - xi
            self._ensure(1)
            self.c.setFont(font, size)
            self.c.setFillColor(colors.black)
            self.c.drawString(TEXT_LEFT + xi, line_y(self.ln) - 4, " ".join(buf))
            self.ln += 1

        for word in words:
            probe = buf + [word]
            xi    = indent + (0 if first else hanging)
            if stringWidth(" ".join(probe), font, size) <= TEXT_WIDTH - xi:
                buf.append(word)
            else:
                if buf:
                    flush(buf, first)
                    first = False
                buf = [word]
        if buf:
            flush(buf, first)

    def rule(self, offset_below=0.3):
        """Draw a horizontal rule offset_below line-heights below current line."""
        y = line_y(self.ln - 1) - LINE_HEIGHT * offset_below
        self.c.setLineWidth(0.75)
        self.c.line(TEXT_LEFT, y, TEXT_RIGHT, y)

    def sig_line(self, width_in=3.5):
        """Draw a signature underline at the current line, then advance."""
        self._ensure(1)
        y = line_y(self.ln) - 4
        self.c.setLineWidth(0.75)
        self.c.line(TEXT_LEFT, y, TEXT_LEFT + width_in * inch, y)
        self.ln += 1


# ── Caption-page helpers ────────────────────────────────────────────────────────

def draw_caption_page(c):
    """
    Draw the full caption page (page 1).
    This page is laid out manually; the Doc class is not used here.
    """
    draw_line_numbers(c)
    draw_footer(c, 1)

    MID = TEXT_LEFT + TEXT_WIDTH / 2     # centre of text column
    STAMP_LEFT = MID + 0.1 * inch        # left edge of clerk-stamp box

    # ── Filer block (lines 1-8, left column) ─────────────────────────────────
    filer = [
        ("DEVONGE CHRISTOPHER DEAN", FONT_BOLD),
        ("P.O. Box 83582",           FONT_NAME),
        ("Los Angeles, CA 90083",    FONT_NAME),
        ("coderchrisdean@protonmail.com", FONT_NAME),
        ("T: 424-345-4299",          FONT_NAME),
        ("",                         FONT_NAME),
        ("Objector, Co-Conservator, and Interested Person,", FONT_NAME),
        ("In Pro Per",               FONT_ITAL),
    ]
    for i, (txt, fnt) in enumerate(filer, start=1):
        if txt:
            c.setFont(fnt, FONT_SIZE)
            c.setFillColor(colors.black)
            c.drawString(TEXT_LEFT, line_y(i) - 4, txt)

    # ── Clerk stamp box (right column, lines 1-7) ────────────────────────────
    box_top    = line_y(1) + LINE_HEIGHT * 0.6
    box_bottom = line_y(7) - LINE_HEIGHT * 0.4
    box_right  = TEXT_RIGHT - 0.05 * inch
    c.setLineWidth(0.75)
    c.setFillColor(colors.white)
    c.rect(STAMP_LEFT, box_bottom,
           box_right - STAMP_LEFT, box_top - box_bottom,
           stroke=1, fill=1)
    c.setFont(FONT_NAME, 9)
    c.setFillColor(colors.grey)
    label_x = STAMP_LEFT + (box_right - STAMP_LEFT) / 2
    c.drawCentredString(label_x, (box_top + box_bottom) / 2 + 5,
                        "FOR CLERK'S FILE STAMP")
    c.drawCentredString(label_x, (box_top + box_bottom) / 2 - 7,
                        "(Do not type in this area)")
    c.setFillColor(colors.black)

    # ── Vertical rule separating columns ─────────────────────────────────────
    c.setLineWidth(0.5)
    c.line(MID - 0.05 * inch, box_top, MID - 0.05 * inch, box_bottom)

    # ── Court name (lines 10 & 11, centred, bold) ────────────────────────────
    c.setFont(FONT_BOLD, FONT_SIZE)
    c.setFillColor(colors.black)
    c.drawCentredString(PAGE_W / 2, line_y(10) - 4,
                        "SUPERIOR COURT OF THE STATE OF CALIFORNIA")
    c.drawCentredString(PAGE_W / 2, line_y(11) - 4,
                        "COUNTY OF LOS ANGELES — PROBATE DIVISION")

    # ── Horizontal rule above case title ─────────────────────────────────────
    c.setLineWidth(0.75)
    c.line(TEXT_LEFT, line_y(12) + LINE_HEIGHT * 0.4, TEXT_RIGHT,
           line_y(12) + LINE_HEIGHT * 0.4)

    # ── Case title / case number block (lines 13-16) ─────────────────────────
    # Left column: case title
    c.setFont(FONT_NAME, FONT_SIZE)
    c.drawString(TEXT_LEFT, line_y(13) - 4, "In re Durable Power of Attorney of")
    c.setFont(FONT_BOLD, FONT_SIZE)
    c.drawString(TEXT_LEFT, line_y(14) - 4, "DOCK DEAN,")
    c.setFont(FONT_NAME, FONT_SIZE)
    c.drawString(TEXT_LEFT + stringWidth("DOCK DEAN, ", FONT_BOLD, FONT_SIZE),
                 line_y(14) - 4, "Conservatee.")

    # Right column: case number + related
    c.setFont(FONT_BOLD, FONT_SIZE)
    c.drawString(MID + 0.15 * inch, line_y(13) - 4, "Case No. 23STPB13044")
    c.setFont(FONT_NAME, FONT_SIZE)
    c.drawString(MID + 0.15 * inch, line_y(14) - 4, "Related: 24STPB01681")

    # Vertical divider inside case title block
    c.setLineWidth(0.5)
    c.line(MID + 0.05 * inch, line_y(12) + LINE_HEIGHT * 0.4,
           MID + 0.05 * inch, line_y(15) - LINE_HEIGHT * 0.4)

    # Horizontal rule under case title
    c.line(TEXT_LEFT, line_y(15) - LINE_HEIGHT * 0.4, TEXT_RIGHT,
           line_y(15) - LINE_HEIGHT * 0.4)

    # ── Document title (lines 17-18, centred, bold) ──────────────────────────
    c.setFont(FONT_BOLD, FONT_SIZE)
    c.drawCentredString(PAGE_W / 2, line_y(17) - 4,
                        "NOTICE OF MOTION AND MOTION TO DISQUALIFY COUNSEL")

    # ── Hearing block (lines 20-24) ──────────────────────────────────────────
    tab  = 1.65 * inch
    hearing = [
        (20, "Hearing Date:", "May 22, 2026"),
        (21, "Time:",         "9:30 a.m."),
        (22, "Department:",   "67"),
        (23, "Judge:",        "Hon. Daniel Juarez"),
    ]
    for ln, label, val in hearing:
        c.setFont(FONT_BOLD, FONT_SIZE)
        c.drawString(TEXT_LEFT + 0.25 * inch, line_y(ln) - 4, label)
        c.setFont(FONT_NAME, FONT_SIZE)
        c.drawString(TEXT_LEFT + tab, line_y(ln) - 4, val)


# ── Main document ───────────────────────────────────────────────────────────────

def build_pdf():
    c = canvas.Canvas(OUTPUT, pagesize=letter)
    c.setTitle("Notice of Motion and Motion to Disqualify Counsel — 23STPB13044")
    c.setAuthor("Devonge Christopher Dean")
    c.setSubject("Motion to Disqualify Counsel — Evans Law Firm, Inc.")

    # ══ PAGE 1 — Caption ══════════════════════════════════════════════════════
    draw_caption_page(c)

    # ══ PAGE 2-4 — Body (Doc handles pagination) ══════════════════════════════
    c.showPage()
    draw_line_numbers(c)
    draw_footer(c, 2)

    d = Doc(c)
    d.page = 2
    d.ln   = 1

    # ── Notice opener ─────────────────────────────────────────────────────────
    d.text("TO ALL PARTIES AND THEIR ATTORNEYS OF RECORD:", font=FONT_BOLD)
    d.skip()
    d.wrapped(
        "PLEASE TAKE NOTICE that on May 22, 2026, at 9:30 a.m. in Department 67, "
        "Movant DEVONGE CHRISTOPHER DEAN, appearing in pro per as Co-Conservator and "
        "Interested Person under Probate Code \u00a7 48, will and hereby does move for "
        "an order disqualifying EVANS LAW FIRM, INC. and INGRID M. EVANS (collectively, "
        "\u201cEvans\u201d) from representing Keithra Snowden or any other party, in any "
        "capacity, in Case No. 23STPB13044 and all related proceedings. The grounds are "
        "set forth fully in the concurrently filed Memorandum of Points and Authorities "
        "and Declaration of Devonge Christopher Dean. In summary:",
        indent=0.5 * inch,
    )
    d.skip()

    # ── Ground 1 ─────────────────────────────────────────────────────────────
    d.text("1.  CONCURRENT CONFLICT OF INTEREST (RULE 1.7).",
           font=FONT_BOLD, indent=0.5 * inch)
    d.skip()
    d.wrapped(
        "Evans jointly represented both co-conservators in this action and in related "
        "Case No. 24STPB01681. While still representing both clients, Evans filed a "
        "Petition for Removal of Co-Conservator against Movant, using confidential "
        "information obtained during the joint representation. Although a Substitution "
        "of Attorney for Snowden has since been filed, substitution does not moot this "
        "motion because Evans retains adverse financial interests and ongoing court-filing "
        "access as set forth below.",
        indent=0.5 * inch,
    )
    d.skip()

    # ── Ground 2 ─────────────────────────────────────────────────────────────
    d.text("2.  PERSONAL FINANCIAL INTEREST AS ONGOING CONFLICT",
           font=FONT_BOLD, indent=0.5 * inch)
    d.text("    (RULES 1.7(b) AND 1.8).", font=FONT_BOLD, indent=0.5 * inch)
    d.skip()
    d.wrapped(
        "Evans filed a Notice of Attorneys\u2019 Lien on February 2, 2026, asserting a "
        "personal financial claim against conservatorship assets and against Movant "
        "personally. The lien references a fee agreement dated February 7, 2024 \u2014 "
        "yet Evans\u2019 own correspondence ties that agreement to a \u201cSuper Bowl "
        "Sunday emergency\u201d that occurred on February 11, 2024, four days after the "
        "stated signature date. The lien is facially defective and has transformed Evans "
        "into an Interested Party with adverse financial interests no substitution can "
        "extinguish.",
        indent=0.5 * inch,
    )
    d.skip()

    # ── Ground 3 ─────────────────────────────────────────────────────────────
    d.text("3.  REQUESTS FOR SPECIAL NOTICE AS STRUCTURAL ONGOING",
           font=FONT_BOLD, indent=0.5 * inch)
    d.text("    PREJUDICE.", font=FONT_BOLD, indent=0.5 * inch)
    d.skip()
    d.wrapped(
        "Evans filed Requests for Special Notice in both proceedings simultaneously with "
        "her withdrawal and lien filings on February 2, 2026. Those filings create a "
        "mandatory, perpetual obligation to serve Evans with every future petition, "
        "report, inventory, and court order in both cases until vacated by court order "
        "\u2014 giving her an ongoing pipeline of privileged filings while she holds "
        "adverse financial interests and two years of Movant\u2019s confidential "
        "communications.",
        indent=0.5 * inch,
    )
    d.skip()

    # ── Ground 4 ─────────────────────────────────────────────────────────────
    d.text("4.  BREACH OF DUTY OF LOYALTY DURING JOINT REPRESENTATION",
           font=FONT_BOLD, indent=0.5 * inch)
    d.text("    (RULES 1.4 AND 1.7).", font=FONT_BOLD, indent=0.5 * inch)
    d.skip()
    d.wrapped(
        "Evans differentially withheld material estate planning documents from Movant "
        "while sharing them with Co-Conservator Snowden, and presented a trust structure "
        "to Movant without disclosing that it was designed to reduce judicial oversight "
        "of her own fees \u2014 documented independently by CAC David P. Stroud in his "
        "Second GAL Report (March 21, 2025), September 2025 Report, and Fifth CAC Report "
        "(January 31, 2026).",
        indent=0.5 * inch,
    )
    d.skip()

    # ── Statutory basis ───────────────────────────────────────────────────────
    d.wrapped(
        "This Motion is made pursuant to Code of Civil Procedure \u00a7 128(a)(5); "
        "California Rules of Professional Conduct Rules 1.4, 1.7, and 1.9; Probate Code "
        "\u00a7\u00a7 2640\u20132644; Business & Professions Code \u00a7 6147; "
        "People ex rel. Dept. of Corporations v. SpeeDee Oil Change Systems, Inc. (1999) "
        "20 Cal.4th 1135; and Flatt v. Superior Court (1994) 9 Cal.4th 275. This Motion "
        "is based on this Notice, the separately filed Memorandum of Points and "
        "Authorities, the concurrently filed Declaration of Devonge Christopher Dean with "
        "all exhibits, the Fifth Report of Court-Appointed Counsel David P. Stroud, and "
        "all papers and records on file in this action.",
        indent=0.5 * inch,
    )
    d.skip(2)

    # ── Dated line ────────────────────────────────────────────────────────────
    d.text("DATED:  _______________________________")
    d.skip(3)

    # ── Signature block ───────────────────────────────────────────────────────
    d.sig_line(width_in=3.5)
    d.text("DEVONGE CHRISTOPHER DEAN", font=FONT_BOLD)
    d.text("In Pro Per / Co-Conservator / Objector / Interested Person")

    # ── Save ──────────────────────────────────────────────────────────────────
    c.save()
    print(f"PDF written to: {OUTPUT}")


if __name__ == "__main__":
    build_pdf()
