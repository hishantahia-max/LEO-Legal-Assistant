
import { HearingEntity, CaseEntity } from '../types';

export const downloadIcsFile = (hearing: HearingEntity, caseDetails?: CaseEntity) => {
  const subject = `Court Hearing: ${caseDetails?.caseNumber || 'Unknown Case'}`;
  const description = `Case: ${caseDetails?.petitionerName || ''} vs ${caseDetails?.respondentName || ''}\\n` +
                      `Court: ${caseDetails?.courtName || 'N/A'}\\n` +
                      `Purpose: ${hearing.purpose}\\n` +
                      `Item No: ${hearing.itemNumber || 'N/A'}`;
  
  // Set time to 10:00 AM by default
  const startTime = hearing.hearingDate.replace(/-/g, '') + 'T100000';
  const endTime = hearing.hearingDate.replace(/-/g, '') + 'T110000'; // 1 hour duration
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AutoDoc Legal//EN
BEGIN:VEVENT
UID:${hearing.hearingId}@autodoc.legal
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${subject}
DESCRIPTION:${description}
LOCATION:${caseDetails?.courtName || 'Court'}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `hearing_${hearing.hearingDate}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
