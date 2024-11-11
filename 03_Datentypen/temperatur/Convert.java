//#START CODE
public class Convert {
    public static void main(String[] args) {
        // Hier wird die Temperatur in Grad Celsius aus der Eingabezeile oben gelesen
        final double celsius = Input.getTemperature(args);
//#START SOLUTION
        // Umrechnung von Celsius in Fahrenheit mit der oben gegebenen Formel.
        double fahrenheit = celsius * 9 / 5 + 32;  

        // Ausgabe des urspruenglichen und des umgerechneten Wertes.
        System.out.print(celsius + " Grad Celsius entsprechen ");
        System.out.println(fahrenheit + " Grad Fahrenheit.");       
//#START CODE
    }
}
//#START API
class Input {
    protected static double getTemperature(String[] args){
        if (args.length == 0) return 0.0;
        try {
            return Double.parseDouble(args[0]);
        } catch (Exception e){
            return 0.0;
        }
    
    }
}