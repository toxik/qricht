// constants
const PI = Math.PI
const PS = (PI / 180)
const STF = 1.00263791  /* ratio time : star time */

/*
radeR converts right ascension and declination to x,y,z.
*/
function radeR (ra, de, r) {
  r[0] = Math.cos(ra) * Math.cos(de)
  r[1] = Math.sin(ra) * Math.cos(de)
  r[2] = Math.sin(de)
  return r
}

/*
Calculates the radiant from two meteor trails and the angle of
convergence between the two trails. QQQ returns -1 when the the
two trails do not intersect in backwards direction. QQQ returns -2
when the distance of one of the trails to the radiant is larger than
120 degrees (but all calculations are made). Otherwise QQQ returns 0.
*/
function qqq (met1, met2, radr, q) {
  // let retval = 0
  let v1 = Array(3)
  let v2 = Array(3)
  let l1 = Array(3)
  let l2 = Array(3)
  let len, cosq
/*
  v1 en v2 zijn de normalen van de vlakken door de radiant, de oorsprong
  en de eerste respectievelijk tweede meteoor. radr is de radiantvector.
*/
  outP(met1.rb, met1.re, v1)
  outP(met2.rb, met2.re, v2)
  outP(v1, v2, radr)
  len = Math.sqrt(inP(radr, radr))
  if (len === 0) {
    q = 0
    return 0
  }
  radr[0] /= len
  radr[1] /= len                           /* Normalisatie op eenheidscirkel */
  radr[2] /= len
  if (inP(met1.rb, radr) < inP(met1.re, radr)) {
    radr[0] = -radr[0]
    radr[1] = -radr[1]          /* Beginpunt moet dichtst bij radiant liggen */
    radr[2] = -radr[2]
  }
/* Controleer of meteoren werkelijk achterwaarts verlengd snijden */
/* en of de afstand tot radiant niet groter is dan 120 graden     */
  // inb1 = inP(met1.rb, radr)
  // inb2 = inP(met2.rb, radr)
  // if (inb2 < inP(met2.re, radr)) retval = -1
  // if (inb1 < -0.5 || inb2 < -0.5) retval = -2
/*
  l1 en l2 zijn de richtingsvectoren van de snijlijnen tussen het raakvlak aan
  de eenheidscirkel ter plekke van de radiant enerzijds en de vlakken v1 en v2
  anderzijds. De hoek tussen l1 en l2 is de convergentiehoek q.
*/
  outP(v1, radr, l1)
  outP(v2, radr, l2)
  cosq = inP(l1, l2) / Math.sqrt(inP(l1, l1) * inP(l2, l2))
  q = Math.acos(cosq)
  if (q > PI / 2) q = PI - q                            /* Zoek de scherpe hoek */
  return q
}

/*
Calculates the vector in-product
*/
function inP (vec1, vec2) {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2]
}

/*
Calculates the vector out-product
*/
function outP (vec1, vec2, vecr) {
  vecr[0] = vec1[1] * vec2[2] - vec1[2] * vec2[1]
  vecr[1] = vec1[2] * vec2[0] - vec1[0] * vec2[2]
  vecr[2] = vec1[0] * vec2[1] - vec1[1] * vec2[0]
}

function azhude (az, elv, phi, u, de) {
  let sinu

  de = Math.sin(elv) * Math.sin(phi) - Math.cos(elv) * Math.cos(az) * Math.cos(phi)
  de = Math.asin(de)
  u = (Math.sin(elv) * Math.cos(phi) + Math.cos(elv) * Math.cos(az) * Math.sin(phi)) / Math.cos(de)
  u = Math.acos(u)
  sinu = Math.cos(elv) * Math.sin(az) / Math.cos(de)
  if (sinu < 0.0) u = 2.0 * PI - u
  return [u, de]
}

export default {
  PI,
  PS,
  STF,
  radeR,
  qqq,
  inP,
  azhude
}
