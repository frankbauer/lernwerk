//#START STATIC
public class HumanColours {
    public static void main(String[] args) {
        // die in der Auswahlliste gewählte Farbe
        String colorName = "";
        if (args.length > 0) {
            colorName = args[0];
        }
        System.out.print(colorName + ": ");

//#START STUDENT

//#START SOLUTION
        if (colorName.equals("RED")) {
            System.out.println("#FF0000");
        } else if (colorName.equals("YELLOW")) {
            System.out.println("#FFFF00");
        } else if (colorName.equals("GREEN")) {
            System.out.println("#00FF00");
        } else if (colorName.equals("CYAN")) {
            System.out.println("#00FFFF");
        } else if (colorName.equals("BLUE")) {
            System.out.println("#0000FF");
        } else if (colorName.equals("MAGENTA")) {
            System.out.println("#FF00FF");
        } else {
            System.out.println("UNBEKANNT");
        }
//#START STATIC
    }
}
