//#START STATIC
public class Rectangle {
    public static void main(String[] args) {    
        // Liest die Breite des Rechtecks aus den Kommandozeilenargumenten
        int width = Input.getWidth(args);
        // Liest die Höhe des Rechtecks aus den Kommandozeilenargumenten
        int height = Input.getHeight(args);
//#START STUDENT

//#START SOLUTION
        
        // Berechnet die Fläche des Rechtecks
        int area = width * height;
        // Berechnet den Umfang des Rechtecks
        int perimeter = 2 * (width + height);

        // Gibt die berechnete Fläche des Rechtecks aus
        System.out.println("Flaeche: " + area);
        // Gibt den berechneten Umfang des Rechtecks aus
        System.out.println("Umfang: " + perimeter);

//#START STATIC
    }
}
//#START API
class Input {
    protected static int getWidth(String[] args){
        if (args.length == 0) return 0;
        try {
            return (int)Double.parseDouble(args[0]);
        } catch (Exception e){
            return 0;
        }    
    }
    protected static int getHeight(String[] args){
        if (args.length < 2) return 0;
        try {
            return (int)Double.parseDouble(args[1]);
        } catch (Exception e){
            return 0;
        }    
    }
}