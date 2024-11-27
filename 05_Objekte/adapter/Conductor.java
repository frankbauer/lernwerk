//#START STATIC
public class Conductor {
    public static void main(String[] args) {            
//#START STUDENT

//#START SOLUTION
        // Mit dem Licht ganz links verbinden
        Adapter a = new Adapter("192.168.7.50", (short)80, "light/0");
        
        // Lampe auf blau setzen...
        a.send("hue", 240);
        // ... die Sättigung auf 75% ändern...
        a.send("saturation", 0.75);
        // ... die Helligkeit auf 50% setzen.
        a.send("brightness", 0.5);       

        // ... und zuletzt die Lampe einschalten.
        a.send("on");
//#START STATIC
    }
}