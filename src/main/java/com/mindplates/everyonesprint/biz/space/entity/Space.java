package com.mindplates.everyonesprint.biz.space.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.util.List;

@Entity
@Builder
@Table(name = "space")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Space extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "name", nullable = false, length = ColumnsDef.NAME)
    private String name;

    @Column(name = "code", nullable = false, length = ColumnsDef.CODE)
    private String code;

    @Column(name = "description", length = ColumnsDef.TEXT)
    private String description;

    @Column(name = "allow_search")
    private Boolean allowSearch;

    @Column(name = "allow_auto_join")
    private Boolean allowAutoJoin;

    @Column(name = "activated")
    private Boolean activated;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "space", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<SpaceUser> users;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "space", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<SpaceApplicant> applicants;

}
