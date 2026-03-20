# Generated manually - make Post.thumbnail optional for text-only posts

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0017_alter_postshare_plataform_choices"),
    ]

    operations = [
        migrations.AlterField(
            model_name="post",
            name="thumbnail",
            field=models.ImageField(blank=True, null=True, upload_to="blog/"),
        ),
    ]
