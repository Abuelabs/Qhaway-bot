const WEEKDAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function getWeekdayStr(d) {
  return WEEKDAY_MAP[d.getDay()];
}

function getDayDifference(d1, d2) {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc1 - utc2) / 86400000);
}

function getStartOfWeek(d) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function getWeekDifference(d1, d2) {
  const w1 = getStartOfWeek(d1);
  const w2 = getStartOfWeek(d2);
  return Math.floor(getDayDifference(w1, w2) / 7);
}

export function matchesRule(rule, d, start) {
  const dReset = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startReset = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  
  if (dReset < startReset) return false;
  
  // Check end condition (date)
  if (rule.end) {
    if (rule.end.type === 'date' && rule.end.value) {
      const endDate = new Date(rule.end.value);
      const endDateReset = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      if (dReset > endDateReset) return false;
    }
  }
  
  const frequency = rule.frequency || 'daily';
  const interval = rule.interval || 1;
  
  if (frequency === 'daily') {
    const dayDiff = getDayDifference(dReset, startReset);
    if (dayDiff % interval !== 0) return false;
    
    if (rule.byDays && rule.byDays.length > 0) {
      const weekday = getWeekdayStr(dReset);
      if (!rule.byDays.includes(weekday)) return false;
    }
    return true;
  }
  
  if (frequency === 'weekly') {
    const weekDiff = getWeekDifference(dReset, startReset);
    if (weekDiff % interval !== 0) return false;
    
    if (rule.byDays && rule.byDays.length > 0) {
      const weekday = getWeekdayStr(dReset);
      return rule.byDays.includes(weekday);
    }
    return dReset.getDay() === startReset.getDay();
  }
  
  if (frequency === 'monthly') {
    const monthDiff = (dReset.getFullYear() - startReset.getFullYear()) * 12 + (dReset.getMonth() - startReset.getMonth());
    if (monthDiff % interval !== 0) return false;
    
    if (rule.byMonthDays && rule.byMonthDays.length > 0) {
      return rule.byMonthDays.includes(dReset.getDate());
    }
    
    if (rule.byWeekdayOfMonth && rule.byWeekdayOfMonth.length > 0) {
      const weekday = getWeekdayStr(dReset);
      const occurrenceIndex = Math.floor((dReset.getDate() - 1) / 7) + 1;
      return rule.byWeekdayOfMonth.some(item => item.weekday === weekday && item.occurrence === occurrenceIndex);
    }
    
    return dReset.getDate() === startReset.getDate();
  }
  
  if (frequency === 'yearly') {
    const yearDiff = dReset.getFullYear() - startReset.getFullYear();
    if (yearDiff % interval !== 0) return false;
    
    if (rule.byWeekdayOfMonth && rule.byWeekdayOfMonth.length > 0) {
      if (dReset.getMonth() !== startReset.getMonth()) return false;
      const weekday = getWeekdayStr(dReset);
      const occurrenceIndex = Math.floor((dReset.getDate() - 1) / 7) + 1;
      return rule.byWeekdayOfMonth.some(item => item.weekday === weekday && item.occurrence === occurrenceIndex);
    }
    
    return dReset.getMonth() === startReset.getMonth() && dReset.getDate() === startReset.getDate();
  }
  
  return false;
}

export function generateOccurrences(rule, start, count = 5) {
  const occurrences = [];
  const startCopy = new Date(start);
  const current = new Date(startCopy.getFullYear(), startCopy.getMonth(), startCopy.getDate());
  
  let loops = 0;
  const maxLoops = 1000;
  
  const endOccurrences = (rule.end && rule.end.type === 'occurrences') ? Number(rule.end.value) : Infinity;
  
  while (occurrences.length < count && occurrences.length < endOccurrences && loops < maxLoops) {
    if (matchesRule(rule, current, startCopy)) {
      occurrences.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
    loops++;
  }
  
  return occurrences;
}

export function describeRecurrenceRule(rule) {
  if (!rule) return 'No aplica';
  
  const frequency = rule.frequency;
  const interval = rule.interval || 1;
  const end = rule.end || { type: 'never' };
  
  let freqText = '';
  
  if (frequency === 'daily') {
    if (interval === 1) {
      if (rule.byDays && rule.byDays.length === 5 && !rule.byDays.includes('sat') && !rule.byDays.includes('sun')) {
        freqText = 'Días laborables';
      } else {
        freqText = 'Diario';
      }
    } else {
      freqText = `Cada ${interval} días`;
    }
  } else if (frequency === 'weekly') {
    const daysLabel = rule.byDays && rule.byDays.length > 0 
      ? `los ${rule.byDays.map(d => {
          const map = { mon: 'Lu', tue: 'Ma', wed: 'Mi', thu: 'Ju', fri: 'Vi', sat: 'Sá', sun: 'Do' };
          return map[d] || d;
        }).join(', ')}`
      : '';
    
    if (interval === 1) {
      freqText = `Semanal ${daysLabel}`;
    } else {
      freqText = `Cada ${interval} semanas ${daysLabel}`;
    }
  } else if (frequency === 'monthly') {
    let monthlyDetails = '';
    if (rule.byMonthDays && rule.byMonthDays.length > 0) {
      monthlyDetails = `el día ${rule.byMonthDays.join(', ')}`;
    } else if (rule.byWeekdayOfMonth && rule.byWeekdayOfMonth.length > 0) {
      monthlyDetails = `el ${rule.byWeekdayOfMonth.map(item => {
        const occMap = { 1: '1er', 2: '2do', 3: '3er', 4: '4to', 5: '5to' };
        const dayMap = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' };
        return `${occMap[item.occurrence]} ${dayMap[item.weekday]}`;
      }).join(' y ')}`;
    }
    
    if (interval === 1) {
      freqText = `Mensual ${monthlyDetails}`;
    } else {
      freqText = `Cada ${interval} meses ${monthlyDetails}`;
    }
  } else if (frequency === 'yearly') {
    let yearlyDetails = '';
    if (rule.byWeekdayOfMonth && rule.byWeekdayOfMonth.length > 0) {
      yearlyDetails = `el ${rule.byWeekdayOfMonth.map(item => {
        const occMap = { 1: '1er', 2: '2do', 3: '3er', 4: '4to', 5: '5to' };
        const dayMap = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' };
        return `${occMap[item.occurrence]} ${dayMap[item.weekday]}`;
      }).join(' y ')}`;
    } else {
      yearlyDetails = 'en esta fecha';
    }
    
    if (interval === 1) {
      freqText = `Anual ${yearlyDetails}`;
    } else {
      freqText = `Cada ${interval} años ${yearlyDetails}`;
    }
  }
  
  let endText = '';
  if (end.type === 'date' && end.value) {
    const parts = end.value.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0].substring(2)}` : end.value;
    endText = ` (hasta ${formattedDate})`;
  } else if (end.type === 'occurrences' && end.value) {
    endText = ` (${end.value} veces)`;
  }
  
  return `${freqText}${endText}`;
}
