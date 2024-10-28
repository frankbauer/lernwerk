public class TypeCast {
    public static void main(String[] args) {
        // Gleitkommadivision mit anschließendem cast zu int 
        // und dann Multiplikation mit 10
        int a = (int)(7.0 / 2.0) * 10;
        System.out.println(a); // Gibt 30 aus
        
        // Gleitkommadivision und Multiplikation vor dem Cast zu int        
        int b = (int)((7.0 / 2.0) * 10);
        System.out.println(b); // Gibt 35 aus
        
        // Implizite Typumwandlung von int zu float nach der Ganzzahldivision
        // d.h. 7 / 2 wird als int berechnet (3), dann in float umgewandelt
        float c = 7 / 2;
        System.out.println(c); // Gibt 3.0 aus
    }
}