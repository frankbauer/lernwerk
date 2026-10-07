//#START STATIC
import java.util.HashMap;

public class ToDoManager {
    private HashMap<String, Boolean> todo;

    public ToDoManager() {
//#START STUDENT

//#START SOLUTION
        todo = new HashMap<String, Boolean>();
//#START STATIC
    }

    // Fügt der ToDo-Liste einen neuen Eintrag hinzu (falls er noch nicht existiert).
    // Neue Einträge sind noch nicht erledigt.
    public void add(String description) {
//#START STUDENT

//#START SOLUTION
        if (!todo.containsKey(description)) {
            todo.put(description, false);
        }
//#START STATIC
    }

    // Markiert den Eintrag als erledigt (nur, wenn er schon existiert).
    // Existiert er nicht, soll die Methode false zurückgeben.
    public boolean done(String description) {
//#START STUDENT

//#START SOLUTION
        if (todo.containsKey(description)) {
            todo.put(description, true);
            return true;
        }
//#START STATIC
        return false;
    }

    // Gibt jeden Eintrag der Liste in einer eigenen Zeile aus. Erledigte Einträge
    // beginnen mit [x], alle anderen mit [ ].
    public void print() {
//#START STUDENT

//#START SOLUTION
        for (String key : todo.keySet()) {
            if (todo.get(key)) {
                System.out.print("[x] ");
            } else {
                System.out.print("[ ] ");
            }
            System.out.println(key);
        }
//#START STATIC
    }

    public static void main(String[] args) {
        ToDoManager t = new ToDoManager();
        t.add("Write Code");
        t.add("Test All");
        t.add("Ship");

        t.done("Write Code");
        t.done("Ship");

        t.print();
    }
}
