//#START STATIC
public class Test {
    public static void main(String[] args) {
//#START STUDENT

//#START SOLUTION
        // Referenz vom Typ des Interfaces, Objekt einer implementierenden Klasse
        Greeting greeting = new Deutsch();
        greeting.greet();

        // dieselbe Variable verweist nun auf ein anderes Objekt
        greeting = new English();
        greeting.greet();

        // Sprache aus dem ersten Programmargument
        greeting = createGreeting(args[0]);
        greeting.greet();
//#START STATIC
    }
