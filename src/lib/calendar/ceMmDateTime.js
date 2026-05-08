// File: ceMmDateTime.js
// Description: Modern Myanmar Calendrical Calculations
// Version: 20250726
//-------------------------------------------------------------------------
// WebSite: https://yan9a.github.io/mmcal/
// MIT License (https://opensource.org/licenses/MIT)
// Copyright (c) 2018 Yan Naing Aye
// Doc: http://cool-emerald.blogspot.com/2013/06/algorithm-program-and-calculation-of.html
//-------------------------------------------------------------------------
export class ceDateTime {
	constructor(m_jd, m_tz, m_ct = 0, m_SG = 2361222) {
		// 2361222 - Gregorian start in British calendar (1752/Sep/14)
		if (m_tz == undefined) this.m_tz = ceDateTime.ltzoh();
		else this.m_tz = m_tz;// time zone for this particular instance 
		if (m_jd == undefined) this.m_jd = ceDateTime.jdnow();
		else this.m_jd = m_jd;// julian date in UTC
		this.m_ct = m_ct; // calendar type [0=British (default), 1=Gregorian, 2=Julian]
		this.m_SG = m_SG; // Beginning of Gregorian calendar in JDN [default=2361222]
	}
	//Start of core functions #############################################################
	static j2w(jd, ct = 0, SG = 2361222) {
		var j, jf, y, m, d, h, n, s;
		if (ct == 2 || (ct == 0 && (jd < SG))) {
			var b, c, f, e;
			j = Math.floor(jd + 0.5); jf = jd + 0.5 - j;
			b = j + 1524; c = Math.floor((b - 122.1) / 365.25); f = Math.floor(365.25 * c);
			e = Math.floor((b - f) / 30.6001); m = (e > 13) ? (e - 13) : (e - 1);
			d = b - f - Math.floor(30.6001 * e); y = m < 3 ? (c - 4715) : (c - 4716);
		}
		else {
			j = Math.floor(jd + 0.5); jf = jd + 0.5 - j; j -= 1721119;
			y = Math.floor((4 * j - 1) / 146097); j = 4 * j - 1 - 146097 * y; d = Math.floor(j / 4);
			j = Math.floor((4 * d + 3) / 1461); d = 4 * d + 3 - 1461 * j;
			d = Math.floor((d + 4) / 4); m = Math.floor((5 * d - 3) / 153); d = 5 * d - 3 - 153 * m;
			d = Math.floor((d + 5) / 5); y = 100 * y + j;
			if (m < 10) { m += 3; }
			else { m -= 9; y = y + 1; }
		}
		jf *= 24; h = Math.floor(jf); jf = (jf - h) * 60; n = Math.floor(jf); s = (jf - n) * 60;
		return { y: y, m: m, d: d, h: h, n: n, s: s };
	}
	static t2d(h, n, s) { return ((h - 12) / 24 + n / 1440 + s / 86400); }
	static w2j(y, m, d, h = 12, n = 0, s = 0, ct = 0, SG = 2361222) {
		var a = Math.floor((14 - m) / 12); y = y + 4800 - a; m = m + (12 * a) - 3;
		var jd = d + Math.floor((153 * m + 2) / 5) + (365 * y) + Math.floor(y / 4);
		if (ct == 1) jd = jd - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
		else if (ct == 2) jd = jd - 32083;
		else {
			jd = jd - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
			if (jd < SG) {
				jd = d + Math.floor((153 * m + 2) / 5) + (365 * y) + Math.floor(y / 4) - 32083;
				if (jd > SG) jd = SG;
			}
		}
		return jd + ceDateTime.t2d(h, n, s);
	}
	static u2j(ut) {
		return 2440587.5 + ut / 86400.0;
	}
	static j2u(jd) {
		return (jd - 2440587.5) * 86400.0 + 0.5;
	}
	static jdnow() {
		return ceDateTime.u2j(new Date().getTime() / 1000.0);
	}
	static ltzoh() {
		return -(new Date().getTimezoneOffset() / 60.0);
	}
	ToString(fs = "%Www %y-%mm-%dd %HH:%nn:%ss %zz") {
		return ceDateTime.j2s(this.m_jd, fs, this.m_tz, this.m_ct, this.m_SG);
	}
	get jd() { return this.m_jd; }
	get jdl() { return (this.m_jd + this.m_tz / 24.0); }
	get jdn() { return Math.round(this.m_jd); }
	get jdnl() { return Math.round(this.m_jd + this.m_tz / 24.0); }
	get y() { return ceDateTime.j2w(this.jdl, this.m_ct, this.m_SG).y; }
	get m() { return ceDateTime.j2w(this.jdl, this.m_ct, this.m_SG).m; }
	get d() { return ceDateTime.j2w(this.jdl, this.m_ct, this.m_SG).d; }
	get w() { return (this.jdnl + 2) % 7; }
}

export class ceMmDateTime extends ceDateTime {
	constructor(m_jd, m_tz, m_ct = 0, m_SG = 2361222, m_syt = 0) {
		super(m_jd, m_tz, m_ct, m_SG);
		this.m_syt = m_syt;
	}
	static GetMyConst(my) {
		var EI, WO, NM, EW = 0, i; var fme, wte;
		if (my >= 1312) { EI = 3; WO = -0.5; NM = 8; fme = [[1377, 1]]; wte = [1344, 1345]; }
		else if (my >= 1217) { EI = 2; WO = -1; NM = 4; fme = [[1234, 1], [1261, -1]]; wte = [1263, 1264]; }
		else if (my >= 1100) { EI = 1.3; WO = -0.85; NM = -1; fme = [[1120, 1], [1126, -1], [1150, 1], [1172, -1], [1207, 1]]; wte = [1201, 1202]; }
		else if (my >= 798) { EI = 1.2; WO = -1.1; NM = -1; fme = [[813, -1], [849, -1], [851, -1], [854, -1], [927, -1], [933, -1], [936, -1], [938, -1], [949, -1], [952, -1], [963, -1], [968, -1], [1039, -1]]; wte = []; }
		else { EI = 1.1; WO = -1.1; NM = -1; fme = [[205, 1], [246, 1], [471, 1], [572, -1], [651, 1], [653, 2], [656, 1], [672, 1], [729, 1], [767, -1]]; wte = []; }
		i = ceMmDateTime.bSearch2(my, fme); if (i >= 0) WO += fme[i][1];
		i = ceMmDateTime.bSearch1(my, wte); if (i >= 0) EW = 1;
		return { EI: EI, WO: WO, NM: NM, EW: EW };
	}
	static bSearch2(k, A) {
		var i = 0, l = 0, u = A.length - 1;
		while (u >= l) { i = Math.floor((l + u) / 2); if (A[i][0] > k) u = i - 1; else if (A[i][0] < k) l = i + 1; else return i; } return -1;
	}
	static bSearch1(k, A) {
		var i = 0, l = 0, u = A.length - 1;
		while (u >= l) { i = Math.floor((l + u) / 2); if (A[i] > k) u = i - 1; else if (A[i] < k) l = i + 1; else return i; } return -1;
	}
	static cal_watat(my) {
		var SY = 1577917828.0 / 4320000.0, LM = 1577917828.0 / 53433336.0, MO = 1954168.050623;
		var c = ceMmDateTime.GetMyConst(my), TA = (SY / 12 - LM) * (12 - c.NM), ed = (SY * (my + 3739)) % LM;
		if (ed < TA) ed += LM; 
        var fm = Math.round(SY * my + MO - ed + 4.5 * LM + c.WO);
		var watat = 0; if (c.EI >= 2) { if (ed >= (LM - (SY / 12 - LM) * c.NM)) watat = 1; }
		else { watat = (my * 7 + 2) % 19; if (watat < 0) watat += 19; watat = Math.floor(watat / 12); }
		watat ^= c.EW; return { fm: fm, watat: watat };
	}
	static cal_my(my) {
		var yd = 0, y1, myt, fm = 0; var y2 = ceMmDateTime.cal_watat(my); myt = y2.watat;
		do { yd++; y1 = ceMmDateTime.cal_watat(my - yd); } while (y1.watat == 0 && yd < 3);
		if (myt) { var nd = (y2.fm - y1.fm) % 354; myt = Math.floor(nd / 31) + 1; fm = y2.fm; }
		else fm = y1.fm + 354 * yd;
		return { myt: myt, tg1: y1.fm + 354 * yd - 102, fm: fm };
	}
	static j2m(jdn) {
		jdn = Math.round(jdn); var MO = 1954168.050623, SY = 1577917828.0 / 4320000.0;
		var my = Math.floor((jdn - 0.5 - MO) / SY), yo = ceMmDateTime.cal_my(my), dd = jdn - yo.tg1 + 1;
		var b = Math.floor(yo.myt / 2), c = Math.floor(1 / (yo.myt + 1)), myl = 354 + (1 - c) * 30 + b, mmt = Math.floor((dd - 1) / myl);
		dd -= mmt * myl; var a = Math.floor((dd + 423) / 512), mm = Math.floor((dd - b * a + c * a * 30 + 29.26) / 29.544);
		var e = Math.floor((mm + 12) / 16), f = Math.floor((mm + 11) / 16), md = dd - Math.floor(29.544 * mm - 29.26) - b * e + c * f * 30;
		return { myt: yo.myt, my: my, mm: mm + f * 3 - e * 4 + 12 * mmt, md: md };
	}
	static cal_mp(md, mm, myt) {
		var mml = 30 - mm % 2; if (mm == 3) mml += Math.floor(myt / 2);
		return (Math.floor((md + 1) / 16) + Math.floor(md / 16) + Math.floor(md / mml));
	}
	get my() { return ceMmDateTime.j2m(this.jdnl).my; }
	get mm() { return ceMmDateTime.j2m(this.jdnl).mm; }
	get md() { return ceMmDateTime.j2m(this.jdnl).md; }
    get myt() { return ceMmDateTime.j2m(this.jdnl).myt; }
    get mp() { return ceMmDateTime.cal_mp(this.md, this.mm, this.myt); }
    fd() { return this.md - 15 * Math.floor(this.md / 16); }
    M() { 
        const names = ["First Waso", "Tagu", "Kason", "Nayon", "Waso", "Wagaung", "Tawthalin", "Thadingyut", "Tazaungmon", "Nadaw", "Pyatho", "Tabodwe", "Tabaung", "Late Tagu", "Late Kason"];
        return names[this.mm] || "Unknown";
    }
    mlen() { var mml = 30 - this.mm % 2; if (this.mm == 3) mml += Math.floor(this.myt / 2); return mml; }
    holidays() { return ceMmDateTime.cal_holiday(this.jdnl); }
    static cal_holiday(jdn) {
        // Simplified holiday function for this implementation
        const hs = []; jdn = Math.round(jdn);
        const yo = ceMmDateTime.j2m(jdn);
        if (yo.mm == 2 && ceMmDateTime.cal_mp(yo.md, yo.mm, yo.myt) == 1) hs.push("Buddha Day (Vesak)");
        if (yo.mm == 4 && ceMmDateTime.cal_mp(yo.md, yo.mm, yo.myt) == 1) hs.push("Waso Full Moon");
        return hs;
    }
}
