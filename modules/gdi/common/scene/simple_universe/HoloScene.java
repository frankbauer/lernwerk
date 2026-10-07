// Hidden helper of the hologram playground (hologram.js): Universum, Sonne and Planet report what happens to them
// (created, changed, printed) as commands, the playground plays them back step by step. Variable names come from
// HoloScene.ref(...) calls that hologram.js appends to the assignments in the student's code for the run only.
class HoloScene {
    static final de.fau.tf.lgdv.runtime.CommandBuffer COMMAND_BUFFER = new de.fau.tf.lgdv.runtime.CommandBuffer();
    private static int NEXT_ID = 1;

    // first command: the layout ("instances": one column per class, "system": planets orbit their sun)
    static void start(String layout) {
        COMMAND_BUFFER.addCommand("layout", new de.fau.tf.lgdv.json.JsonObject().put("value", layout));
    }

    // tint objects without owner red (a sun without universe, a planet without sun); call before the objects are
    // created, e.g. in the exercise's MainOverride. Default: on
    static void showOrphans(boolean show) {
        COMMAND_BUFFER.addCommand("orphans", new de.fau.tf.lgdv.json.JsonObject().put("value", show));
    }

    static int create(String type, int owner) {
        int id = NEXT_ID++;
        COMMAND_BUFFER.addCommand("new", new de.fau.tf.lgdv.json.JsonObject()
            .put("type", type).put("id", id).put("owner", owner));
        return id;
    }

    static void set(int id, String key, double value) {
        COMMAND_BUFFER.addCommand("set", new de.fau.tf.lgdv.json.JsonObject()
            .put("id", id).put("key", key).put("value", value));
    }

    static void print(int id) {
        COMMAND_BUFFER.addCommand("print", new de.fau.tf.lgdv.json.JsonObject().put("id", id));
    }

    // variable `name` now references `o` (-1: null or not one of the scene's objects)
    static void ref(Object o, String name) {
        int id = -1;
        if (o instanceof Universum) {
            id = ((Universum) o).holoId;
        } else if (o instanceof Sonne) {
            id = ((Sonne) o).holoId;
        } else if (o instanceof Planet) {
            id = ((Planet) o).holoId;
        }
        COMMAND_BUFFER.addCommand("ref", new de.fau.tf.lgdv.json.JsonObject().put("id", id).put("name", name));
    }

    static void finish() {
        COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");
    }
}
