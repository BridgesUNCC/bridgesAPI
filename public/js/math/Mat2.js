/**
 * @author Zachary Wartell, ...
 * @version 1.x-14
 * @file Mat2.js 
 *
 * Mat2.js is a set of geometry and linear algebra functions related to 2x2 Matrices.
 *
 * Students are given skeleton code for an initial set of classes, methods, and functions and are expected to implement,
 * and extend them and add additional functions to this file as needed.
 * 
 */

/** @author Zachary Wartell
 * @description  test equality of 2 floating point numbers
 * @param {Number} a - double
 * @param {Number} b - double (default Number)
 * @returns {Boolean}
 */
function equal(a,b)
{    
    return Math.abs(a-b)< Number.EPSILON;
}

/** @author Zachary Wartell
 * @description  test equality of a 32 bit float and 64 bit float
 * @param {Number} a - 32 bit float
 * @param {Number} b - 64 bit float
 * @returns {Boolean}
 */
function equalfd(a,b)
{        
    // @todo [Wartell] find better way to do this ...
    /* AFIK - Javascript lacks a 32bit float EPISLON
            - JS seems to lack any proper float to double conversion
    */
    var stupid = new Float32Array([b]); 
    return Math.abs(a-stupid[0])< Number.EPSILON;
}


/* **Unused right now**
 * @author Zachary Wartell
 *
 * @description  Assume a matrix of size 'rows' x 'columns' with indices ranges from 0 to rows-1 or column-1.
 * Return an array
 */
function minorIndices(rows,columns,i,j)
{

}

/**
 * @author Zachary Wartell
 *
 * @description Return determinant of a 2x2 matrix
 *
 * @param {Number} M_00
 * @param {Number} M_10
 * @param {Number} M_01
 * @param {Number} M_11
 */
function det2(M_00, M_10, M_01, M_11)
{
    // @todo [STUDENT REQUIRED] implement
    // Done
    return ((M_00*M_11) - (M_10 * M_01));
}


/**
 * @author Zachary Wartell
 * @class  Mat2 is a 2x2 linear algebra matrix
 * 
 * Elements are stored in 'column major' layout [{@link Cite.2}], i.e.
 * for matrix M with math convention M_rc (r=row,c=column):
 * ```javascript
 *    this.array = [ M_00, M_10,    // first column
 *                   M_01, M_11 ];  // second column
 * ```
 *
 * Details:
 *
 * - Note, column major order is consistent with OpenGL and GLSL [{@link Cite.3}].
 * - For efficiency and GLSL compatibility we use a TypedArray [{@link Cite.1}].
 *
 */
class Mat2
{
    /**
     * Construct a Mat2 initialized to I.
     *
     * @todo [STUDENT] if/as needed - add additional options for constructor arguments
     * @author Zachary Wartell && ..
     * @param {null}
     *
     */
    constructor()
    {
        this.array = new Float32Array(4);
        this.array.set([1.0, 0.0,
            0.0, 1.0]);
    }
    
    /**
     * @author Zachary Wartell
     * @description  'get' returns element in column c, row r of this Mat2
     * @param {Number} r - row
     * @param {Number} c - column
     * @returns {Number}
     */
    get (r, c)
    {
        return this.array[c*2+r];
    }
    
    /**
     * @author Zachary Wartell
     * @description  'set' sets element at column c, row r to value 'val'.
     * @param {Number} r - row
     * @param {Number} c - column
     * @param {Number} val - value
     * @returns {Number}
     */
    set (r, c, val)
    {
        this.array[c*2+r] = val;
    }
    

    /**
     * @author Zachary Wartell
     * @description  'det' return the determinant of this Mat2
     * @returns {Number}
     */
    det ()
    {
        return det2(this.array[0],this.array[1],
            this.array[2],this.array[3]);
    }
}

/**
 * @author Zachary Wartell
 * @class  Vec2 represents coordinates of a 2D geometric point or vector.
 */
class Vec2
{

    /**
     * Construct new Vec2
     *
     * @author Zachary Wartell
     * @param {null | Number[] | Vec2 | ...Number } x,y - (default) [0,0] | Array (size 2) | Vec2 | x,y
     */
    constructor()
    {
        if (arguments.length === 0)
        {// no arguements, so initial to 0's
            this.array = new Float32Array(2);
            this.array.set([0.0, 0.0]);
        }
        else if (arguments.length === 1)
        {// 1 argument, ...
            if (arguments[0] instanceof Vec2)
            {// argument is Vec2, so copy it
                this.array = new Float32Array(arguments[0].array);
            }
            else if (arguments[0] instanceof Array)
            {// argument is Array, so copy it
                this.array = new Float32Array(arguments[0]);
            }
        }
    }

    /** @author Zachary Wartell
     * @description  Set this Vec2 coordinates to values stored in 'v'
     * @param {Array | Float32Array | Vec3} v
     * @returns {undefined}
     */
    set (v)
    {
        if (v instanceof Array)
        {
            this.array.set(v);
        }
        else if (v instanceof Float32Array)
        {
            this.array.set(v);
        }
        else if (v instanceof Vec2)
        {
            this.array.set(v.array);
        }
        else
            throw new Error("Unsupported Type");
    }
    
    /**
     * @author Zachary Wartell
     * @description  Subtract Vec2 "v1" from this Vec2, i.e. in math notation
     * assuming "v" is this Vec2:
     *
     * v' = v + v1
     * @param {Vec2} v1
     */
    add (v1)
    {
        this.array.set([this.array[0] + v1.array[0], this.array[1] + v1.array[1]]);
    }
    
    /**
     * @author Zachary Wartell
     * @description  Subtract Vec2 "v1" from this Vec2, i.e. in math notation
     * assuming "v" is this Vec2:
     *
     * v' = v - v1
     *
     * @param {Vec2} v1
     */
    sub (v1)
    {
        /*
         * @todo needs to be implemented
         */
        // Done
        this.array.set([this.array[0] - v1.array[0], this.array[1] - v1.array[1]]);
    }
    
    /**
     * @author Zachary Wartell
     * @description  Treat this Vec2 as a column matrix and multiply it by Mat2 'm' to it's left, i.e. in math notation
     * assuming "v" is this Vec2:
     *
     * v' = M v
     *
     * @param {Mat2} M
     */
    multiply (M)
    {
        this.array.set([this.array[0]*M.array[0] + this.array[1]*M.array[2],
            this.array[0]*M.array[1] + this.array[1]*M.array[3] ]);
    }
    
    /**
     * @author Zachary Wartell
     * @description  Treat this Vec2 as a row matrix and multiply it by Mat2 'M' to it's right, i.e.
     *
     * v' = v M
     *
     * @param {Mat2} M
     */
    rightMultiply (M)
    {
        this.array.set([this.array[0]*M.array[0] + this.array[1]*M.array[1],
            this.array[0]*M.array[2] + this.array[1]*M.array[3] ]);
    }
    
    /**
     * @author Zachary Wartell
     * @description  Return the dot product of this Vec2 with Vec2 'v'
     * @param {Vec2} v
     * @return {Number}
     */
    dot (v)
    {
        /*
         * @todo needs to be implemented
         */
        // Done
        return (this.array[0] * v.array[0]) + (this.array[1] * v.array[1]);
    }
    
    /**
     * @author Zachary Wartell
     * @description Return the magnitude (i.e. length) of of this Vec2
     * @return {Number}
     */
    mag ()
    {
        /*
         * @todo needs to be implemented
         */
        // Done
        return Math.sqrt((this.array[0])^2 + (this.array[1])^2);
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
}

/**
 * @author Zachary Wartell && ... 
 * @description  This contains misc. code for testing and demonstrating the functions in this file.
 * 
 * Note, the tests are not meant to be comprehensive, but rather only provide examples.
 * 
 * Students can add to this function for testing their additional math2d.js code...
 */
function Mat2_test()
{
    var M1 = new Mat2(), M2 = new Mat2();
    var v0 = new Vec2(), v1 = new Vec2([5.0,5.0]), v2, 
        vx = new Vec2([1.0,0.0]),
        vy = new Vec2([0.0,1.0]);
                
    var rad = 45 * Math.PI/180;
    M1.set(0,0, Math.cos(rad)); M1.set(0,1, -Math.sin(rad)); 
    M1.set(1,0, Math.sin(rad)); M1.set(1,1,  Math.cos(rad));
    
    M2.set(0,0, Math.cos(rad)); M2.set(0,1, -Math.sin(rad)); 
    M2.set(1,0, Math.sin(rad)); M2.set(1,1,  Math.cos(rad));    
       
    v0.x = 1.0;
    v0.y = 2.0;
    v0.y += 1.0;
    v2 = new Vec2(v0);
    v2.add(v1);
    console.assert(v2.x === 6 && v2.y === 8);
    
    vx.multiply(M1);       
    vy.multiply(M1);  
           
    console.assert(equalfd(vy.x,-Math.sin(rad)) && equalfd (vy.y,Math.cos(rad)) &&
                   equalfd(vx.x, Math.cos(rad)) && equalfd (vx.y,Math.sin(rad)));
     
}
