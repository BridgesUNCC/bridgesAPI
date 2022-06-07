/**
 * @author Zachary Wartell, ...
 * @version 1.x-16
 *
 * @file Mat3.js is a set of geometry and linear algebra functions related to 3x3 Matrices.
 *
 * Students are given skeleton code for an initial set of classes, methods, and functions and are expected to implement,
 * and extend them and add additional functions to this file as needed.
 *
 *
 */
/*
Note, this comment is record of a failed attempt to get JSDoc to support citations
This trick only worked within a single file & comment not across files... so it didn't quite work...
 #### References

   1. <a name="R1"></a> {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays}
   2. <a name="R2"></a> {@link https://en.wikipedia.org/wiki/Row-_and_column-major_order}
   3. <a name="R3"></a> {@link https://en.wikibooks.org/wiki/GLSL_Programming/Vector_and_Matrix_Operations}

*/

const Mat3_ROWS=3;
const Mat3_COLUMNS=3;
const Mat3_SIZE=Mat3_ROWS*Mat3_COLUMNS;

/**
 * @author Zachary Wartell
 *
 * @description Return determinant of a 3x3 matrix
 *
 * @param {Number} M_00
 * @param {Number} M_10
 * @param {Number} M_20
 * @param {Number} M_01
 * @param {Number} M_11
 * @param {Number} M_21
 * @param {Number} M_02
 * @param {Number} M_12
 * @param {Number} M_22
 */
function det3(M_00, M_10, M_20,
              M_01, M_11, M_21,
              M_02, M_12, M_22)
{
    /** @todo [STUDENT] REQUIRED: implement */
    //M_00, M_01, M_02
    //M_10, M_11, M_12
    //M_20, M_21, M_22
    // Done
    let val1 = M_00*det2(M_11, M_21, M_12, M_22)
    let val2 = - (M_10*det2(M_01, M_21, M_02, M_22))
    let val3 = M_20*det2(M_01, M_11, M_02, M_12)
    let finalDet = val1 + val2 + val3
    return finalDet
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

/**
 * @author Zachary Wartell
 * @class Mat3 is a 3x3 linear algebra matrix
 *
 * Elements are internally stored in 'column major' layout [{@link Cite.2}], i.e. for matrix M with math convention M_rc (r=row,c=column)
 * ```javascript
 *    this.array = [ M_00, M_10, M_20,   // first column
 *                   M_01, M_11, M_21,   // second column
 *                   M_02, M_12, M_22 ]; // third column
 * ```
 * Equivalently:
 *
 * ```javascript
 *    this.array [0] = M_00;  this.array [3] = M_01;  this.array [6] = M_02
 *    this.array [1] = M_10;  this.array [4] = M_11;  this.array [7] = M_12
 *    this.array [2] = M_20;  this.array [5] = M_21;  this.array [8] = M_22
 * ```
 *
 * When the constructor is called with a Array or Float32Array parameter the above convention should be followed.
 *
 * Details:
 *
 * - Note, column major order is consistent with OpenGL and GLSL [{@link Cite.3}].
 * - For efficiency and GLSL compatibility we use a TypedArray [{@link Cite.1}].
 *
 * */
class Mat3
{
    /**
     * Construct new Mat3
     *
     * Argument Options [Overloaded]:
     * - null  | default, initializes to I
     * - Number[] | initial value (size 9)
     * - Mat3 | initial value
     * - Number, Number ..., Number | initial value - M_00,M_10,M_20, M_01, M_11, M_21,  M_02,M_12,M_22 M_03,M_13,M_23
     *
     * @param {*} - multiple options, see description for details
     * @author Zachary Wartell
     * @@param {(null | Number[] | Float32Array | Mat3 | ...Number )} matrix - INITIAL VALUE - null | Array (size 9) | Float32Array (size 9) | Mat3 | or 9 Number's in column major order
     **/
    constructor()
    {
        if (arguments.length === Mat3_SIZE)
        {
            this.array[0] = arguments[0]; this.array[1] = arguments[3]; this.array[2] = arguments[6];
            this.array[3] = arguments[1]; this.array[4] = arguments[4]; this.array[5] = arguments[7];
            this.array[6] = arguments[2]; this.array[7] = arguments[5]; this.array[8] = arguments[8];
        } else if (arguments.length === 1)
        {
            if (arguments[0] instanceof Array)
            {
                this.array = new Float32Array(Mat3_SIZE);
                this.array.set(arguments[0]);
            } else if (arguments[0] instanceof Mat3)
            {
                this.array = new Float32Array(Mat3_SIZE);
                this.array.set(arguments[0].array);
            } else
                throw new Error("Unsupported Type");
        } else
        {
            this.array = new Float32Array(Mat3_SIZE);
            this.array.set([1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 0.0, 1.0]);
        }
    }

    /**
     * @author Zachary Wartell
     * @description 'get' returns element in row r, column c of this Mat3
     * @param {Number} r - row
     * @param {Number} c - column
     * @returns {Number}
     */
    get (r, c)
    {
        return this.array[c * Mat3_ROWS + r];  // note use of column-major ordering, @see #R3
    }

    /**
     * @author Zachary Wartell
     * @description 'set' sets element at row r, column c to value 'val'.
     * @param {Number} r - row
     * @param {Number} c - column
     * @param {Number} val - value
     */
    set (r, c, val)
    {
        this.array[c * Mat3_ROWS + r] = val;   // note use of column-major ordering, @see #R3
    }

    /**
     * @author Zachary Wartell
     *
     * @description Return determinant of a 3x3 matrix stored in 'array'.
     *
     * @param {Array} array
     */

    /**
     * @author Zachary Wartell
     * @description 'det' returns the determinant of this Mat3
     * @returns {Number}
     */
    det ()
    {
        return det3(...this.array); // ES6 spread operator
    }

    /**
     * @author Zachary Wartell
     *
     * @description Right multiply this Mat3 by a matrix 'matrix', i.e.
     * in mathematical notation, let "M" equal this Mat3, and 'M1' equal 'matrix':
     *
     *     M' = M * M1
     *
     * @param {Mat3} matrix
     */
    multiply (matrix)
    {
        if (!(matrix instanceof Mat3))
            throw new Error("Unsupported Type");

        /** @todo [STUDENT] REQUIRED: implement */
        // Done
        let new00 = ((this.array[0]*matrix.array[0]) + (this.array[3]*matrix.array[1]) + (this.array[6]*matrix.array[2]));
        let new01 = (this.array[0]*matrix.array[3]) + (this.array[3]*matrix.array[4]) + (this.array[6]*matrix.array[5]);
        let new02 = (this.array[0]*matrix.array[6]) + (this.array[3]*matrix.array[7]) + (this.array[6]*matrix.array[8]);

        let new10 = (this.array[1]*matrix.array[0]) + (this.array[4]*matrix.array[1]) + (this.array[7]*matrix.array[2]);
        let new11 = (this.array[1]*matrix.array[3]) + (this.array[4]*matrix.array[4]) + (this.array[7]*matrix.array[5]);
        let new12 = (this.array[1]*matrix.array[6]) + (this.array[4]*matrix.array[7]) + (this.array[7]*matrix.array[8]);

        let new20 = (this.array[2]*matrix.array[0]) + (this.array[5]*matrix.array[1]) + (this.array[8]*matrix.array[2]);
        let new21 = (this.array[2]*matrix.array[3]) + (this.array[5]*matrix.array[4]) + (this.array[8]*matrix.array[5]);
        let new22 = (this.array[2]*matrix.array[6]) + (this.array[5]*matrix.array[7]) + (this.array[8]*matrix.array[8]);

        this.array [0] = new00;  this.array [3] = new01;  this.array [6] = new02;
        this.array [1] = new10;  this.array [4] = new11;  this.array [7] = new12;
        this.array [2] = new20;  this.array [5] = new21;  this.array [8] = new22;



    }

    /**
     * @author Zachary Wartell
     *
     * @description Left multiply this Mat3 by a matrix 'matrix' (denoted M1).
     * In mathematical notation, let "M" equal this Mat3, and 'M1' equal argument 'matrix':
     *
     *    M' = M1 * M
     *
     * For many calculations Mat3.multiply (a 'right multiply') is sufficient, but occasionally being able to leftMultiply is useful.
     *
     * @param {Mat3} matrix
     */
    leftMultiply (matrix)
    {
        if (!(matrix instanceof Mat3))
            throw new Error("Unsupported Type");
        /** @todo [STUDENT] implement if/when needed */
        throw new Error("UNIMPLEMENTED FUNCTION");
    };

    /**
     * @author Zachary Wartell
     * @description Set this Mat3 to a new 2D translation matrix that translates by vector [x,y]
     *
     * @param { Array[] } translation translation vector
     * @param { Number } translation[].0 x
     * @param { Number } translation[].1 y
     */
    setTranslate (translate)
    {
        if (translate instanceof Array)
        {
            this.array[0] = 1.0;  this.array[3] = 0.0;  this.array[6] = translate[0];
            this.array[1] = 0.0;  this.array[4] = 1.0;  this.array[7] = translate[1];
            this.array[2] = 0.0;  this.array[5] = 0.0;  this.array[8] = 1.0;
        } else
            throw new Error("Unsupported Type");
    };

    /**
     * @author Zachary Wartell
     *
     * @description Right multiply this Mat3 by a 2D translation matrix that translates by vector [x,y], i.e.
     * in mathematical notation, let "M" equal this Mat3, and 'M_t' equal the translate matrix:
     *
     *     M' = M * M_t
     *
     * @param { Array[] } translation translation vector
     * @param { Number } translation[].0 x
     * @param { Number } translation[].1 y
     */
    translate (translate)
    {
        if (translate instanceof Array)
        {
            var M_t = new Mat3(
                [1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                translate[0], translate[1], 1.0]);
            this.multiply(M_t);
        } else
            throw new Error("Unsupported Type");
    };

    /**
     * @author Zachary Wartell
     *
     * @description Left multiply this Mat3 by a 2D translation matrix that translates by vector [x,y], i.e.
     * in mathematical notation, let "M" equal this Mat3, and 'M_t' equal the translate matrix:
     *
     *     M' = M_t * M
     *
     * See also comment on Mat3.prototype.leftMultiply
     *
     * @param { Array[] } translation translation vector
     * @param { Number } translation[].0 x
     * @param { Number } translation[].1 y
     */
    leftTranslate (translate)
    {
        if (translate instanceof Array)
        {
            var M_t = new Mat3([1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                translate[0], translate[1], 1.0]);
            this.leftMultiply(M_t);
        } else
            throw new Error("Unsupported Type");
    };

    /**
     * @author Zachary Wartell && ..
     * @description set this Mat3 to a new 2D scale matrix that scales by scale factors [sx,sy]
     *
     * @param { Array[] } scale_factors scale factors
     * @param { Number } scale_factors[].0 x
     * @param { Number } scale_factors[].1 y
     */
    setScale (scale_factors)
    {
        /** @todo [STUDENT] implement if/when needed */
        throw new Error("UNIMPLEMENTED FUNCTION");
    };

    /**
     * @author Zachary Wartell && ..
     * @description Right multiply this Mat3 by the 2D scale matrix that scales by scale factors [sx,sy], i.e.
     * in mathematical notation, let "M" equal this Mat3, and 'M_s' equal the scale matrix:
     *
     *      M' = M * M_s
     *
     * @param { Array[] } scale_factors scale factors
     * @param { Number } scale_factors[].0 x
     * @param { Number } scale_factors[].1 y
     */
    scale (scale_factors)
    {
        /** @todo [STUDENT] REQUIRED: implement */
        // Done
        if (scale_factors instanceof Array)
        {
            var M_s = new Mat3([scale_factors[0], 0.0, 0.0,
                0.0, scale_factors[1], 0.0,
                0.0, 0.0, 1.0]);
            this.multiply(M_s);
        } else
            throw new Error("Unsupported Type");
    };

    /**
     * @author Zachary Wartell && ..
     * @description Left multiply this Mat3 by the 2D scale matrix that scales by scale factors [sx,sy], i.e.
     * in mathematical notation, let "M" equal this Mat3, and 'M_s' equal the scale matrix:
     *
     *      M' = M_s * M
     *
     * @param { Array[] } scale_factors scale factors
     * @param { Number } scale_factors[].0 x
     * @param { Number } scale_factors[].1 y
     */
    leftScale (scale_factors)
    {
        /** @todo [STUDENT] implement if/when needed */
        throw new Error("UNIMPLEMENTED FUNCTION");
    }

    /**
     * @author Zachary Wartell && ..
     * @description set this Mat3 to a new 2D rotation matrix that rotates by angle 'angle'
     *
     * @param {Number} angle - measured in degrees
     */
    setRotate (angle)
    {
        /** @todo [STUDENT] REQUIRED: implement */
        // Done
        if (angle)
        {
            this.array = new Mat3([Math.cos(toRadians(angle)), Math.sin(toRadians(angle)), 0.0,
                -Math.sin(toRadians(angle)), Math.cos(toRadians(angle)), 0.0,
                0.0, 0.0, 1.0]);
        } else
            throw new Error("Unsupported Type");

    }

    /**
     * @author Zachary Wartell && ..
     * @description  Right multiply this Mat3 by the 2D rotation matrix that rotates by angle 'angle', e.g.
     * in mathematical notation, let "M" equal this Mat3, and 'M_r' equal the rotation matrix:
     *
     *      M' = M * M_r
     *
     * @param {Number} angle - measured in degrees
     */
    rotate (angle)
    {
        /** @todo [STUDENT] REQUIRED: implement */
        // Done
        if (angle)
        {
            var M_r = new Mat3([Math.cos(toRadians(angle)), Math.sin(toRadians(angle)), 0.0,
                -Math.sin(toRadians(angle)), Math.cos(toRadians(angle)), 0.0,
                0.0, 0.0, 1.0]);
            this.multiply(M_r);
        } else
            throw new Error("Unsupported Type");
    }

    /**
     * @author Zachary Wartell && ..
     * @description Left multiply this Mat3 by the 2D rotation matrix that rotates by angle 'angle', e.g.
     * in mathematical notation, let "M" equal this Mat3, and 'M_r' equal the rotation matrix:
     *
     *      M' = M_r * M
     *
     * See comment on Mat3.prototype.leftMultiply
     *
     * @param {Number} angle - measured in degrees
     */
    leftRotate (angle)
    {
        /** @todo [STUDENT] implement if/when needed */
        throw new Error("UNIMPLEMENTED FUNCTION");
    }

    /**
     * @author Zachary Wartell
     * @description  set this Mat3 to the identity matrix
     *
     */
    setIdentity ()
    {
        this.array[0] = 1.0;
        this.array[3] = 0.0;
        this.array[6] = 0.0;
        this.array[1] = 0.0;
        this.array[4] = 1.0;
        this.array[7] = 0.0;
        this.array[2] = 0.0;
        this.array[5] = 0.0;
        this.array[8] = 1.0;
    }
}

const Vec3_SIZE=3;

/**
 * @author Zachary Wartell
 * @class Vec3 represents one of several different types of geometric objects or linear algebra objects.
 * Vec3 represents either:
 *    - the homogenous coordinates of 2D geometric points or vectors, stored as (x,y,w)
 * OR
 *    - the regular coordinates of 3D geometric points or vectors, stored as (x,y,z)
 *
 * For 2D computations, the Vec3 should be used as (x,y,w), while for 3D computations it should be used as (x,y,z).
 *
 * For operations combining Mat3 and Vec3 (which are 2D geometry computations), Vec3 is typically treated as a column matrix:
 * ```
 *         | x |
 *         | y |
 *         | w |
 * ```
 * but some Mat3 methods treat Vec3 as a row matrix [x y w]
 *
 * For efficiency Vec3 uses a TypedArray {@link Cite.1}.
 */
class Vec3
{
    /**
     * Construct a Vec3
     *
     * @author Zachary Wartell
     * @param {null | Number[] | Float32Array | Vec3 | ...Number }  x,y,z - <default> [0,0,0] | Array (size 3) | Float32Array (size 3) | Vec2, Number | Vec3 | x,y,z
     */
    constructor()
    {
        this.array = new Float32Array(Vec3_SIZE);
        if (arguments.length === 0)
        // no arguements, so initial to 0's
            this.array.set([0.0, 0.0, 0.0]);
        else
            this.set(...arguments); // ES6 'spread' operator

    }

    /**
     * @author Zachary Wartell
     *
     * @description Treat this Vec3 as a column matrix and multiply it by Mat3 'M' on it's left, i.e.
     * mathematically, denoting this Vec3 as "v":
     *
     *   v' = M v
     *
     * @param {Mat3} m
     */
    multiply (M)
    {
        if (!(M instanceof Mat3))
            throw new Error("Unsupported Type");

        this.array.set([this.array[0] * M.array[0] + this.array[1] * M.array[3] + this.array[2] * M.array[6],
            this.array[0] * M.array[1] + this.array[1] * M.array[4] + this.array[2] * M.array[7],
            this.array[0] * M.array[2] + this.array[1] * M.array[5] + this.array[2] * M.array[8]]);
    }

    /**
     * @author Zachary Wartell
     *
     * @description  Treat this Vec3 as a row matrix and multiply it by Mat3 'M' on it's right, i.e.
     * mathematically, denoting this Vec3 as "v":
     *
     *    v' = v M
     *
     * For many calculations Vec3.multiply (a 'left multiply') is sufficient, but occasionally being able to rightMultiply is useful.
     *
     * @param {Mat3} m
     */
    rightMultiply (M)
    {
        if (!(M instanceof Mat3))
            throw new Error("Unsupported Type");
        /** @todo [STUDENT] implement if/when needed */
        throw new Error("UNIMPLEMENTED FUNCTION");
    }

    /**
     * @author Zachary Wartell
     * @description Set this Vec3 coordinates to values in arguments
     *
     *
     * @param {Number[] | Float32Array | Vec3 | ...Number }  x,y,z - Array (size 3) | Float32Array (size 3) | Vec2, Number | x,y,z
     * @@param {Number[] | Float32Array | Vec3 | Vec2, Number | ...Number }  x,y,z - Array (size 3) | Float32Array (size 3) |
     * @returns {undefined}
     */
    set ()
    {
        if (arguments.length === 1)
        {
            if (arguments[0] instanceof Array)
                this.array.set(arguments[0]);
            else if (arguments[0] instanceof Float32Array)
                this.array.set(arguments[0]);
            else if (arguments[0] instanceof Vec3)
                this.array.set(arguments[0].array);
            else
                throw new Error("Unsupported Type");
        } else if (arguments.length === Vec3_SIZE-1) {
            if (arguments[0] instanceof Vec2 && typeof arguments[1] === 'number')
            {
                this.x = arguments[0].x;
                this.y = arguments[0].y;
                this.w = arguments[1];
            } else
                throw new Error("Unsupported Type");
        } else if (arguments.length === Vec3_SIZE) {
            this.array.set(arguments);
        } else
            throw new Error("Unsupported Type");
    }


    add (v)
    {
        /** @todo [STUDENT] implement if/when needed */
        this.array[0] = this.array[0] + v.array[0];
        this.array[1] = this.array[1] + v.array[1];
        this.array[2] = this.array[2] + v.array[2];
    }

    sub (v)
    {
        /** @todo [STUDENT] implement if/when needed */
        this.array[0] = this.array[0] - v.array[0];
        this.array[1] = this.array[1] - v.array[1];
        this.array[2] = this.array[2] - v.array[2];
    }

    /**
     *  @author Zachary Wartell
     *  @description return xyz length of this Vec3 (assuming it represents a 3D coordinate (non-homogenous))
     */
    mag ()
    {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    }

    /**
     *  @author Zachary Wartell
     *  @description convert this Vec3 to a unit vector with the same direction
     */
    normalize()
    {
        let i_mag = 1.0/this.mag();
        this.array[0] *= i_mag;
        this.array[1] *= i_mag;
        this.array[2] *= i_mag;
    }

    cross(v){
      return[this.array[1] * v.array[2] - this.array[2] * v.array[1],
              this.array[2] * v.array[0] - this.array[0] * v.array[2],
              this.array[0] * v.array[1] - this.array[1] * v.array[0]];
    }

    /**
     *  @author Zachary Wartell && ...
     *  @description return the dot product of this Vec3 and Vec3 'v'
     */
    dot (v)
    {
        /** @todo [STUDENT] implement if/when needed */
        // Done
        return this.array[0]*v.array[0] + this.array[1]*v.array[1] + this.array[2]*v.array[2]
    }


    /**
     * @author Zachary Wartell
     * @description getter for x-coordinate
     */
    get x(){
        return this.array[0];
    }

    /**
     * @author Zachary Wartell
     * @description setter for x-coordinate
     */
    set x(x_){
        this.array[0] = x_;
    }

    /**
     * @author Zachary Wartell
     * @description getter for y-coordinate
     */
    get y(){
        return this.array[1];
    }

    /**
     * @author Zachary Wartell
     * @description setter for y-coordinate
     */
    set y(y_){
        this.array[1] = y_;
    }

    /**
     * @author Zachary Wartell
     * @description getter for z-coordinate
     */
    get z(){
        return this.array[2];
    }

    /**
     * @author Zachary Wartell
     * @description setter for z-coordinate
     */
    set z(z_){
        this.array[2] = z_;
    }

    /**
     * @author Zachary Wartell
     * @description getter for w-coordinate (alias for z-coordinate)
     */
    get w(){
        return this.array[2];
    }

    /**
     * @author Zachary Wartell
     * @description setter for w-coordinate (alias for z-coordinate)
     */
    set w(w_){
        this.array[2] = w_;
    }
}

/**
 * @author Zachary Wartell && ...
 *
 * @description This contains misc. code for testing and giving examples of using functions and methods in this file.
 *
 * Student Note: The tests are not meant to be comprehensive, but rather only provide examples.
 * Students can add to this function for testing their additional code...
 *
 */
function Mat3_test()
{
    var M1 = new Mat2();
    var M2 = new Mat3();
    var v0 = new Vec2(), v1 = new Vec2([5.0, 5.0]), v2,
        vx = new Vec2([1.0, 0.0]),
        vy = new Vec2([0.0, 1.0]),
        vx_h = new Vec3([1.0, 0.0, 0.0]), /* 'h' is for homogenous coordinate */
        vy_h = new Vec3(0.0, 1.0, 0.0),
        po_h = new Vec3();

    var rad = 45 * Math.PI / 180;
    M1.set(0, 0, Math.cos(rad));
    M1.set(0, 1, -Math.sin(rad));
    M1.set(1, 0, Math.sin(rad));
    M1.set(1, 1, Math.cos(rad));

    M2.set(0, 0, Math.cos(rad));
    M2.set(0, 1, -Math.sin(rad));
    M2.set(1, 0, Math.sin(rad));
    M2.set(1, 1, Math.cos(rad));

    // add test
    v0.x = 1.0;
    v0.y = 2.0;
    v0.y += 1.0;
    v2 = new Vec2(v0);
    v2.add(v1);
    console.assert(v2.x === 6 && v2.y === 8);

    // multiply test
    vx.multiply(M1);
    vy.multiply(M1);

    console.assert(equalfd(vy.x, -Math.sin(rad)) && equalfd(vy.y, Math.cos(rad)) &&
            equalfd(vx.x, Math.cos(rad)) && equalfd(vx.y, Math.sin(rad)));

    // multiply test
    var po = new Vec2([0,0]);
    po_h.set (po,1);

    vx_h.multiply(M2);
    vy_h.multiply(M2);
    //po_h.multiply(M2);
    console.assert(equalfd(vy_h.x, -Math.sin(rad)) && equalfd(vy_h.y, Math.cos(rad)) &&
            equalfd(vx_h.x, Math.cos(rad)) && equalfd(vx_h.y, Math.sin(rad)));

    // transform tests
    var M3 = new Mat3();
    M3.setTranslate([10.0, 15.0]);
    M3.translate([5.0, 5.0]);
    po_h.multiply(M3);

    console.assert(equalfd(po_h.x, 15) && equalfd(po_h.y, 20));


    // transform tests
    var M4 = new Mat3(), M5 = new Mat3();

    M4.setTranslate([10, 10]);
    M4.rotate(50);
    M4.scale([5, 10]);

    M5.setTranslate([-10, -10]);
    //M5.leftRotate(-50);
    //M5.leftScale([1 / 5, 1 / 10]);

    MI = new Mat3(M5);
    MI.multiply(M4);

    var test = det3(1,2,3,4,5,6,7,8,9);
    console.log(test)

    // determinant tests
    console.assert(det3(
        1,2,3,
        4,5,6,
        7,8,9) === 0);

    console.assert(det3(
        1,2,3,
        4,5,6,
        7,8,10) === -3);

    /* @todo add more tests as needed */
}
