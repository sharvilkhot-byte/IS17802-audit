import { IS17802Clause } from '../types';

/**
 * Maps axe-core rule IDs → IS 17802 clauses
 * IS 17802 Chapter 9 directly mirrors WCAG 2.1 AA
 * Clause format: 9.X.X.X where X.X.X = WCAG success criterion number
 */

const CLAUSE_MAP: Record<string, IS17802Clause> = {
  // ─── 1.1 Text Alternatives ───────────────────────────────────────────────
  'image-alt': {
    clause: '9.1.1.1', wcag: '1.1.1', level: 'A',
    title: 'Non-text Content',
    principle: 'Perceivable',
  },
  'input-image-alt': {
    clause: '9.1.1.1', wcag: '1.1.1', level: 'A',
    title: 'Non-text Content',
    principle: 'Perceivable',
  },
  'object-alt': {
    clause: '9.1.1.1', wcag: '1.1.1', level: 'A',
    title: 'Non-text Content',
    principle: 'Perceivable',
  },
  'role-img-alt': {
    clause: '9.1.1.1', wcag: '1.1.1', level: 'A',
    title: 'Non-text Content',
    principle: 'Perceivable',
  },
  'svg-img-alt': {
    clause: '9.1.1.1', wcag: '1.1.1', level: 'A',
    title: 'Non-text Content',
    principle: 'Perceivable',
  },
  'image-redundant-alt': {
    clause: '9.1.1.1', wcag: '1.1.1', level: 'A',
    title: 'Non-text Content',
    principle: 'Perceivable',
  },

  // ─── 1.2 Time-based Media ────────────────────────────────────────────────
  'video-caption': {
    clause: '9.1.2.2', wcag: '1.2.2', level: 'A',
    title: 'Captions (Prerecorded)',
    principle: 'Perceivable',
  },
  'audio-caption': {
    clause: '9.1.2.2', wcag: '1.2.2', level: 'A',
    title: 'Captions (Prerecorded)',
    principle: 'Perceivable',
  },
  'video-description': {
    clause: '9.1.2.5', wcag: '1.2.5', level: 'AA',
    title: 'Audio Description (Prerecorded)',
    principle: 'Perceivable',
  },

  // ─── 1.3 Adaptable ───────────────────────────────────────────────────────
  'aria-required-children': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'aria-required-parent': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'definition-list': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'dlitem': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'list': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'listitem': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'table-duplicate-name': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'td-headers-attr': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'th-has-data-cells': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'scope-attr-valid': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'landmark-one-main': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'region': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'avoid-inline-spacing': {
    clause: '9.1.4.12', wcag: '1.4.12', level: 'AA',
    title: 'Text Spacing',
    principle: 'Perceivable',
  },
  'autocomplete-valid': {
    clause: '9.1.3.5', wcag: '1.3.5', level: 'AA',
    title: 'Identify Input Purpose',
    principle: 'Perceivable',
  },

  // ─── 1.4 Distinguishable ─────────────────────────────────────────────────
  'color-contrast': {
    clause: '9.1.4.3', wcag: '1.4.3', level: 'AA',
    title: 'Contrast (Minimum)',
    principle: 'Perceivable',
  },
  'color-contrast-enhanced': {
    clause: '9.1.4.6', wcag: '1.4.6', level: 'AAA',
    title: 'Contrast (Enhanced)',
    principle: 'Perceivable',
  },
  'meta-viewport': {
    clause: '9.1.4.4', wcag: '1.4.4', level: 'AA',
    title: 'Resize Text',
    principle: 'Perceivable',
  },
  'meta-viewport-large': {
    clause: '9.1.4.10', wcag: '1.4.10', level: 'AA',
    title: 'Reflow',
    principle: 'Perceivable',
  },
  'image-redundant-alt-2': {
    clause: '9.1.4.5', wcag: '1.4.5', level: 'AA',
    title: 'Images of Text',
    principle: 'Perceivable',
  },

  // ─── 2.1 Keyboard Accessible ─────────────────────────────────────────────
  'accesskeys': {
    clause: '9.2.1.4', wcag: '2.1.4', level: 'A',
    title: 'Character Key Shortcuts',
    principle: 'Operable',
  },
  'tabindex': {
    clause: '9.2.1.1', wcag: '2.1.1', level: 'A',
    title: 'Keyboard',
    principle: 'Operable',
  },
  'scrollable-region-focusable': {
    clause: '9.2.1.1', wcag: '2.1.1', level: 'A',
    title: 'Keyboard',
    principle: 'Operable',
  },
  'frame-focusable-content': {
    clause: '9.2.1.2', wcag: '2.1.2', level: 'A',
    title: 'No Keyboard Trap',
    principle: 'Operable',
  },

  // ─── 2.4 Navigable ───────────────────────────────────────────────────────
  'bypass': {
    clause: '9.2.4.1', wcag: '2.4.1', level: 'A',
    title: 'Bypass Blocks',
    principle: 'Operable',
  },
  'document-title': {
    clause: '9.2.4.2', wcag: '2.4.2', level: 'A',
    title: 'Page Titled',
    principle: 'Operable',
  },
  'focus-order-semantics': {
    clause: '9.2.4.3', wcag: '2.4.3', level: 'A',
    title: 'Focus Order',
    principle: 'Operable',
  },
  'link-in-text-block': {
    clause: '9.2.4.4', wcag: '2.4.4', level: 'A',
    title: 'Link Purpose (In Context)',
    principle: 'Operable',
  },
  'link-name': {
    clause: '9.2.4.4', wcag: '2.4.4', level: 'A',
    title: 'Link Purpose (In Context)',
    principle: 'Operable',
  },
  'heading-order': {
    clause: '9.2.4.6', wcag: '2.4.6', level: 'AA',
    title: 'Headings and Labels',
    principle: 'Operable',
  },
  'focus-visible': {
    clause: '9.2.4.7', wcag: '2.4.7', level: 'AA',
    title: 'Focus Visible',
    principle: 'Operable',
  },
  'css-orientation-lock': {
    clause: '9.1.3.4', wcag: '1.3.4', level: 'AA',
    title: 'Orientation',
    principle: 'Perceivable',
  },

  // ─── 2.5 Input Modalities ────────────────────────────────────────────────
  'label-content-name-mismatch': {
    clause: '9.2.5.3', wcag: '2.5.3', level: 'A',
    title: 'Label in Name',
    principle: 'Operable',
  },

  // ─── 3.1 Readable ────────────────────────────────────────────────────────
  'html-has-lang': {
    clause: '9.3.1.1', wcag: '3.1.1', level: 'A',
    title: 'Language of Page',
    principle: 'Understandable',
  },
  'html-lang-valid': {
    clause: '9.3.1.1', wcag: '3.1.1', level: 'A',
    title: 'Language of Page',
    principle: 'Understandable',
  },
  'valid-lang': {
    clause: '9.3.1.2', wcag: '3.1.2', level: 'AA',
    title: 'Language of Parts',
    principle: 'Understandable',
  },

  // ─── 3.2 Predictable ─────────────────────────────────────────────────────
  'meta-refresh': {
    clause: '9.3.2.5', wcag: '3.2.5', level: 'AAA',
    title: 'Change on Request',
    principle: 'Understandable',
  },

  // ─── 3.3 Input Assistance ────────────────────────────────────────────────
  'label': {
    clause: '9.3.3.2', wcag: '3.3.2', level: 'A',
    title: 'Labels or Instructions',
    principle: 'Understandable',
  },
  'label-title-only': {
    clause: '9.3.3.2', wcag: '3.3.2', level: 'A',
    title: 'Labels or Instructions',
    principle: 'Understandable',
  },
  'select-name': {
    clause: '9.3.3.2', wcag: '3.3.2', level: 'A',
    title: 'Labels or Instructions',
    principle: 'Understandable',
  },

  // ─── 4.1 Compatible ──────────────────────────────────────────────────────
  'duplicate-id': {
    clause: '9.4.1.1', wcag: '4.1.1', level: 'A',
    title: 'Parsing',
    principle: 'Robust',
  },
  'duplicate-id-active': {
    clause: '9.4.1.1', wcag: '4.1.1', level: 'A',
    title: 'Parsing',
    principle: 'Robust',
  },
  'duplicate-id-aria': {
    clause: '9.4.1.1', wcag: '4.1.1', level: 'A',
    title: 'Parsing',
    principle: 'Robust',
  },
  'aria-allowed-attr': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-command-name': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-hidden-body': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-hidden-focus': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-input-field-name': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-meter-name': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-progressbar-name': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-required-attr': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-roles': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-toggle-field-name': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-tooltip-name': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-valid-attr': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-valid-attr-value': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'button-name': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'frame-title': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'input-button-name': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'aria-live-region-content': {
    clause: '9.4.1.3', wcag: '4.1.3', level: 'AA',
    title: 'Status Messages',
    principle: 'Robust',
  },

  // ─── IBM Equal Access rules ──────────────────────────────────────────────
  // 1.1.1 Non-text Content
  'WCAG20_Img_HasAlt':                { clause:'9.1.1.1', wcag:'1.1.1', level:'A',  title:'Non-text Content',        principle:'Perceivable' },
  'WCAG20_Img_TitleEmptyWhenAltNull': { clause:'9.1.1.1', wcag:'1.1.1', level:'A',  title:'Non-text Content',        principle:'Perceivable' },
  'WCAG20_Img_AltEmptyWhenDecorative':{ clause:'9.1.1.1', wcag:'1.1.1', level:'A',  title:'Non-text Content',        principle:'Perceivable' },
  'WCAG20_Area_HasAlt':               { clause:'9.1.1.1', wcag:'1.1.1', level:'A',  title:'Non-text Content',        principle:'Perceivable' },
  'WCAG20_Object_HasText':            { clause:'9.1.1.1', wcag:'1.1.1', level:'A',  title:'Non-text Content',        principle:'Perceivable' },
  'WCAG20_Applet_HasAlt':             { clause:'9.1.1.1', wcag:'1.1.1', level:'A',  title:'Non-text Content',        principle:'Perceivable' },
  'HAAC_Aria_ImgAlt':                 { clause:'9.1.1.1', wcag:'1.1.1', level:'A',  title:'Non-text Content',        principle:'Perceivable' },
  'HAAC_BackgroundImg_HasTextOrTitle':{ clause:'9.1.1.1', wcag:'1.1.1', level:'A',  title:'Non-text Content',        principle:'Perceivable' },
  'RPT_Img_UsemapValid':              { clause:'9.1.1.1', wcag:'1.1.1', level:'A',  title:'Non-text Content',        principle:'Perceivable' },

  // 1.2 Time-based Media
  'WCAG20_Media_AltTrigger':          { clause:'9.1.2.1', wcag:'1.2.1', level:'A',  title:'Audio-only and Video-only', principle:'Perceivable' },
  'RPT_Media_VideoObjectTrigger':     { clause:'9.1.2.1', wcag:'1.2.1', level:'A',  title:'Audio-only and Video-only', principle:'Perceivable' },
  'RPT_Media_AudioVideoAltFilename':  { clause:'9.1.2.1', wcag:'1.2.1', level:'A',  title:'Audio-only and Video-only', principle:'Perceivable' },
  'HAAC_Video_HasNoTrack':            { clause:'9.1.2.2', wcag:'1.2.2', level:'A',  title:'Captions (Prerecorded)',  principle:'Perceivable' },
  'HAAC_Audio_VideoAlt':              { clause:'9.1.2.1', wcag:'1.2.1', level:'A',  title:'Audio-only and Video-only', principle:'Perceivable' },

  // 1.3.1 Info and Relationships
  'WCAG20_Input_ExplicitLabel':       { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'WCAG20_Input_RadioChkInFieldSet':  { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'WCAG20_Select_HasOptGroup':        { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'WCAG20_Table_SummaryAria3':        { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'WCAG20_Fieldset_HasLegend':        { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'WCAG20_Label_RefValid':            { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'RPT_Table_DataHeadingsAria':       { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'RPT_List_UseMarkup':               { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'RPT_Blockquote_HasCite':           { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'HAAC_Figure_label':                { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },
  'WCAG20_Table_CapSummRedundant':    { clause:'9.1.3.1', wcag:'1.3.1', level:'A',  title:'Info and Relationships',  principle:'Perceivable' },

  // 1.3.4 Orientation
  'WCAG21_Style_Viewport':            { clause:'9.1.3.4', wcag:'1.3.4', level:'AA', title:'Orientation',             principle:'Perceivable' },

  // 1.3.5 Identify Input Purpose
  'WCAG21_Input_Autocomplete':        { clause:'9.1.3.5', wcag:'1.3.5', level:'AA', title:'Identify Input Purpose',  principle:'Perceivable' },

  // 1.4.1 Use of Color
  'RPT_List_Misuse':                  { clause:'9.1.4.1', wcag:'1.4.1', level:'A',  title:'Use of Color',            principle:'Perceivable' },

  // 1.4.2 Audio Control
  'RPT_Media_AudioTrigger':           { clause:'9.1.4.2', wcag:'1.4.2', level:'A',  title:'Audio Control',           principle:'Perceivable' },

  // 1.4.3 Contrast
  'IBMA_Color_Contrast_WCAG2AA':      { clause:'9.1.4.3', wcag:'1.4.3', level:'AA', title:'Contrast (Minimum)',      principle:'Perceivable' },
  'IBMA_Color_Contrast_WCAG2AA_PV':   { clause:'9.1.4.3', wcag:'1.4.3', level:'AA', title:'Contrast (Minimum)',      principle:'Perceivable' },

  // 1.4.10 Reflow
  'WCAG21_Elem_Scrollable_Horizontal':{ clause:'9.1.4.10',wcag:'1.4.10',level:'AA', title:'Reflow',                  principle:'Perceivable' },

  // 2.1.1 Keyboard
  'WCAG20_Script_FocusBlurs':         { clause:'9.2.1.1', wcag:'2.1.1', level:'A',  title:'Keyboard',                principle:'Operable' },
  'RPT_Elem_EventMouseAndKey':        { clause:'9.2.1.1', wcag:'2.1.1', level:'A',  title:'Keyboard',                principle:'Operable' },
  'WCAG20_Elem_TabIndexNotNeg':       { clause:'9.2.1.1', wcag:'2.1.1', level:'A',  title:'Keyboard',                principle:'Operable' },

  // 2.2.2 Pause, Stop, Hide
  'RPT_Marquee_Trigger':              { clause:'9.2.2.2', wcag:'2.2.2', level:'A',  title:'Pause, Stop, Hide',       principle:'Operable' },
  'WCAG20_Blink_AlwaysTrue':          { clause:'9.2.2.2', wcag:'2.2.2', level:'A',  title:'Pause, Stop, Hide',       principle:'Operable' },

  // 2.4.1 Bypass Blocks
  'RPT_Html_SkipNav':                 { clause:'9.2.4.1', wcag:'2.4.1', level:'A',  title:'Bypass Blocks',           principle:'Operable' },

  // 2.4.2 Page Titled
  'WCAG20_Doc_HasTitle':              { clause:'9.2.4.2', wcag:'2.4.2', level:'A',  title:'Page Titled',             principle:'Operable' },

  // 2.4.4 Link Purpose
  'WCAG20_A_HasText':                 { clause:'9.2.4.4', wcag:'2.4.4', level:'A',  title:'Link Purpose (In Context)',principle:'Operable' },
  'WCAG20_A_TargetAndText':           { clause:'9.2.4.4', wcag:'2.4.4', level:'A',  title:'Link Purpose (In Context)',principle:'Operable' },
  'RPT_A_RedundantHref':              { clause:'9.2.4.4', wcag:'2.4.4', level:'A',  title:'Link Purpose (In Context)',principle:'Operable' },
  'WCAG20_A_InlineText':              { clause:'9.2.4.4', wcag:'2.4.4', level:'A',  title:'Link Purpose (In Context)',principle:'Operable' },

  // 2.4.6 Headings and Labels
  'RPT_Header_HasContent':            { clause:'9.2.4.6', wcag:'2.4.6', level:'AA', title:'Headings and Labels',     principle:'Operable' },
  'RPT_Header_Trigger':               { clause:'9.2.4.6', wcag:'2.4.6', level:'AA', title:'Headings and Labels',     principle:'Operable' },

  // 3.1.1 Language of Page
  'WCAG20_Html_HasLang':              { clause:'9.3.1.1', wcag:'3.1.1', level:'A',  title:'Language of Page',        principle:'Understandable' },
  'WCAG20_Elem_Lang_Valid':           { clause:'9.3.1.1', wcag:'3.1.1', level:'A',  title:'Language of Page',        principle:'Understandable' },

  // 3.2.1 On Focus
  'WCAG20_Select_NoChangeAction':     { clause:'9.3.2.1', wcag:'3.2.1', level:'A',  title:'On Focus',                principle:'Understandable' },

  // 3.2.2 On Input
  'WCAG20_Input_HasOnchange':         { clause:'9.3.2.2', wcag:'3.2.2', level:'A',  title:'On Input',                principle:'Understandable' },
  'WCAG20_Form_TargetAndText':        { clause:'9.3.2.2', wcag:'3.2.2', level:'A',  title:'On Input',                principle:'Understandable' },

  // 3.3.2 Labels or Instructions
  'WCAG20_Input_LabelBefore':         { clause:'9.3.3.2', wcag:'3.3.2', level:'A',  title:'Labels or Instructions',  principle:'Understandable' },
  'WCAG20_Input_LabelAfter':          { clause:'9.3.3.2', wcag:'3.3.2', level:'A',  title:'Labels or Instructions',  principle:'Understandable' },
  'RPT_Label_UniqueFor':              { clause:'9.3.3.2', wcag:'3.3.2', level:'A',  title:'Labels or Instructions',  principle:'Understandable' },
  'WCAG20_Input_InFieldSet':          { clause:'9.3.3.2', wcag:'3.3.2', level:'A',  title:'Labels or Instructions',  principle:'Understandable' },

  // 4.1.2 Name, Role, Value
  'Rpt_Aria_ValidRole':                        { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_ValidIdRef':                       { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_RequiredProperties':               { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_RequiredChildren_Native_Host_Sematics':  { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_RequiredParent_Native_Host_Sematics':    { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_EventHandlerUseAttribute':         { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_WidgetLabels_Implicit':            { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_OrphanedContent_Native_Host_Sematics': { clause:'9.1.3.1', wcag:'1.3.1', level:'A', title:'Info and Relationships', principle:'Perceivable' },
  'HAAC_Combobox_ARIA_11_Guideline':           { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'HAAC_Combobox_Autocomplete':                { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'HAAC_Combobox_MustHaveChild':               { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'HAAC_Combobox_Popup':                       { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'HAAC_Listbox_ARIA_Check_Empty':             { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'HAAC_Active_Desc_Name':                     { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'HAAC_Application_Role_Text':                { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'WCAG20_Frame_HasTitle':                     { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_ContentinfoWithNoMain_Implicit':   { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_MultipleBannerLandmarks_Implicit': { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_MultipleMainsRequireLabel_Implicit_2': { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_MultipleNavigationLandmarks_Implicit': { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },
  'Rpt_Aria_MultipleRegionsUniqueLabel_Implicit':  { clause:'9.4.1.2', wcag:'4.1.2', level:'A', title:'Name, Role, Value', principle:'Robust' },

  // ─── Custom checks ───────────────────────────────────────────────────────
  'custom-skip-link': {
    clause: '9.2.4.1', wcag: '2.4.1', level: 'A',
    title: 'Bypass Blocks',
    principle: 'Operable',
  },
  'custom-heading-structure': {
    clause: '9.2.4.6', wcag: '2.4.6', level: 'AA',
    title: 'Headings and Labels',
    principle: 'Operable',
  },
  'custom-vague-links': {
    clause: '9.2.4.4', wcag: '2.4.4', level: 'A',
    title: 'Link Purpose (In Context)',
    principle: 'Operable',
  },
  'custom-empty-buttons': {
    clause: '9.4.1.2', wcag: '4.1.2', level: 'A',
    title: 'Name, Role, Value',
    principle: 'Robust',
  },
  'custom-form-errors': {
    clause: '9.3.3.1', wcag: '3.3.1', level: 'A',
    title: 'Error Identification',
    principle: 'Understandable',
  },
  'custom-target-size': {
    clause: '9.2.5.5', wcag: '2.5.5', level: 'AA',
    title: 'Target Size',
    principle: 'Operable',
  },
  'custom-focus-visible': {
    clause: '9.2.4.7', wcag: '2.4.7', level: 'AA',
    title: 'Focus Visible',
    principle: 'Operable',
  },
  'custom-table-headers': {
    clause: '9.1.3.1', wcag: '1.3.1', level: 'A',
    title: 'Info and Relationships',
    principle: 'Perceivable',
  },
  'custom-input-autocomplete': {
    clause: '9.1.3.5', wcag: '1.3.5', level: 'AA',
    title: 'Identify Input Purpose',
    principle: 'Perceivable',
  },
  'custom-skip-link-target': {
    clause: '9.2.4.1', wcag: '2.4.1', level: 'A',
    title: 'Bypass Blocks',
    principle: 'Operable',
  },
  'custom-noop-anchor': {
    clause: '9.2.4.4', wcag: '2.4.4', level: 'A',
    title: 'Link Purpose (In Context)',
    principle: 'Operable',
  },
  'custom-new-tab-warning': {
    clause: '9.3.2.2', wcag: '3.2.2', level: 'A',
    title: 'On Input',
    principle: 'Understandable',
  },
  'custom-icon-link-label': {
    clause: '9.1.1.1', wcag: '1.1.1', level: 'A',
    title: 'Non-text Content',
    principle: 'Perceivable',
  },
  'custom-lang-attribute': {
    clause: '9.3.1.1', wcag: '3.1.1', level: 'A',
    title: 'Language of Page',
    principle: 'Understandable',
  },
  'custom-min-text-size': {
    clause: '9.1.4.4', wcag: '1.4.4', level: 'AA',
    title: 'Resize Text',
    principle: 'Perceivable',
  },
  'custom-session-timeout': {
    clause: '9.2.2.1', wcag: '2.2.1', level: 'A',
    title: 'Timing Adjustable',
    principle: 'Operable',
  },
  'custom-captcha-alt': {
    clause: '9.1.1.1', wcag: '1.1.1', level: 'A',
    title: 'Non-text Content',
    principle: 'Perceivable',
  },
};

const UNKNOWN_CLAUSE: IS17802Clause = {
  clause: '9.4.1.2',
  wcag: '4.1.2',
  level: 'A',
  title: 'Name, Role, Value',
  principle: 'Robust',
};

export function getClause(ruleId: string): IS17802Clause {
  return CLAUSE_MAP[ruleId] ?? UNKNOWN_CLAUSE;
}

export { CLAUSE_MAP };
